use std::collections::VecDeque;
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
  enq_capacity: Arc<Mutex<usize>>,
  deq_capacity: Arc<Mutex<usize>>,
  enq_closed: Arc<Mutex<bool>>,
  deq_closed: Arc<Mutex<bool>>,
  queue_subscription_receiver: Arc<Mutex<Receiver<T>>>,
  queue_subscription_sender: Arc<Mutex<Sender<T>>>,
}

impl<T: std::fmt::Debug + Clone> Queue<T> {
  pub fn new(max_size: usize) -> Self {
    let (sender, receiver) = mpsc::channel(100);
    Queue {
      queue: Arc::new(Mutex::new(VecDeque::new())),
      enq_capacity: Arc::new(Mutex::new(max_size)),
      deq_capacity: Arc::new(Mutex::new(0)),
      enq_closed: Arc::new(Mutex::new(false)),
      deq_closed: Arc::new(Mutex::new(false)),
      queue_subscription_receiver: Arc::new(Mutex::new(receiver)),
      queue_subscription_sender: Arc::new(Mutex::new(sender)),
    }
  }

  pub async fn subscribe(&self) -> Arc<Mutex<Receiver<T>>> {
    self.queue_subscription_receiver.clone()
  }

  pub async fn enqueue(&self, item: T) -> Result<(), QueueError> {
    let mut enq_capacity = self.enq_capacity.lock().await;
    let mut queue = self.queue.lock().await;

    if *self.enq_closed.lock().await {
      return Err(QueueError::EnqueueClosed);
    }

    if queue.len() == *enq_capacity {
      return Err(QueueError::QueueFull);
    }

    let _ = self
      .queue_subscription_sender
      .lock()
      .await
      .send(item.clone())
      .await;

    queue.push_back(QueueItem::Item(item));
    *enq_capacity -= 1;
    *self.deq_capacity.lock().await += 1;

    Ok(())
  }

  pub async fn dequeue(&self) -> Result<T, QueueError> {
    let mut deq_capacity = self.deq_capacity.lock().await;
    let mut queue = self.queue.lock().await;

    if *self.deq_closed.lock().await {
      return Err(QueueError::DequeueClosed);
    }

    if queue.is_empty() {
      return Err(QueueError::QueueEmpty);
    }

    if let QueueItem::Closed = queue.front().unwrap() {
      *self.deq_closed.lock().await = true;
      return Err(QueueError::QueueClosed);
    }

    let item = queue.pop_front().unwrap();
    *deq_capacity -= 1;
    *self.enq_capacity.lock().await += 1;

    if let QueueItem::Item(x) = item {
      Ok(x)
    } else {
      unreachable!()
    }
  }

  pub async fn close(&self) {
    let mut queue = self.queue.lock().await;
    queue.push_back(QueueItem::Closed);
    *self.enq_closed.lock().await = true;
  }
}
