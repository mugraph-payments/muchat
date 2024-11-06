use std::sync::atomic::{AtomicBool, Ordering};
use std::{collections::VecDeque, sync::atomic::AtomicUsize};
use std::sync::Arc;
use tokio::sync::{
  mpsc::{self, Receiver, Sender},
  Mutex,
};

#[derive(Debug)]
pub enum QueueError {
  QueueFull,
  EnqueueClosed,
  QueueEmpty,
  DequeueClosed,
  QueueClosed,
}

#[derive(Debug)]
#[allow(dead_code)]
pub enum QueueItem<T> {
  Item(T),
  Closed,
}

#[derive(Debug, Clone)]
pub struct Queue<T> {
  queue: Arc<Mutex<VecDeque<QueueItem<T>>>>,
  enq_capacity: Arc<AtomicUsize>,
  deq_capacity: Arc<AtomicUsize>,
  enq_closed: Arc<AtomicBool>,
  deq_closed: Arc<AtomicBool>,
  queue_subscription_receiver: Arc<Mutex<Receiver<T>>>,
  queue_subscription_sender: Arc<Mutex<Sender<T>>>,
}

impl<T: std::fmt::Debug + Clone> Queue<T> {
  pub fn new(max_size: usize) -> Self {
    let (sender, receiver) = mpsc::channel(100);
    Queue {
      queue: Arc::new(Mutex::new(VecDeque::new())),
      enq_capacity: Arc::new(AtomicUsize::new(max_size)),
      deq_capacity: Arc::new(AtomicUsize::new(0)),
      enq_closed: Arc::new(AtomicBool::new(false)),
      deq_closed: Arc::new(AtomicBool::new(false)),
      queue_subscription_receiver: Arc::new(Mutex::new(receiver)),
      queue_subscription_sender: Arc::new(Mutex::new(sender)),
    }
  }

  pub async fn subscribe(&self) -> Arc<Mutex<Receiver<T>>> {
    self.queue_subscription_receiver.clone()
  }

  pub async fn enqueue(&self, item: T) -> Result<(), QueueError> {
    let mut queue = self.queue.lock().await;

    if self.enq_closed.load(Ordering::SeqCst) {
      return Err(QueueError::EnqueueClosed);
    }

    if queue.len() == self.enq_capacity.load(Ordering::SeqCst) {
      return Err(QueueError::QueueFull);
    }

    let _ = self
      .queue_subscription_sender
      .lock()
      .await
      .send(item.clone())
      .await;

    queue.push_back(QueueItem::Item(item));
    self.enq_capacity.fetch_sub(1, Ordering::SeqCst);
    self.deq_capacity.fetch_add(1, Ordering::SeqCst);

    Ok(())
  }

  pub async fn dequeue(&self) -> Result<T, QueueError> {
    let mut queue = self.queue.lock().await;

    if self.deq_closed.load(Ordering::SeqCst) {
      return Err(QueueError::DequeueClosed);
    }

    if queue.is_empty() {
      return Err(QueueError::QueueEmpty);
    }

    if let QueueItem::Closed = queue.front().unwrap() {
      self.deq_closed.store(true, Ordering::SeqCst);
      return Err(QueueError::QueueClosed);
    }

    let item = queue.pop_front().unwrap();
    self.deq_capacity.fetch_sub(1, Ordering::SeqCst);
    self.enq_capacity.fetch_add(1, Ordering::SeqCst);

    if let QueueItem::Item(x) = item {
      Ok(x)
    } else {
      unreachable!()
    }
  }

  pub async fn close(&self) {
    let mut queue = self.queue.lock().await;
    queue.push_back(QueueItem::Closed);
    self.enq_closed.store(true, Ordering::SeqCst);
  }
}
