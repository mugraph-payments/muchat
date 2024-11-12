use futures::channel::mpsc;
use futures::sink::SinkExt;
use futures::stream::{Stream, StreamExt};
use iced::futures::{self, pin_mut};
use iced::padding::left;
use iced::widget::text::Style as TextStyle;
use iced::widget::text_editor::Style;
use iced::widget::{
    self, column, container, horizontal_rule, mouse_area, row, scrollable, text, text_editor,
    vertical_rule,
};
use iced::Alignment::Center;
use iced::Length::{self, Fill};
use iced::{color, stream, Border, Element, Font, Padding, Subscription, Task};
use muchat_providers::chat::client::ChatClient;
use muchat_providers::chat::commands::ChatCommand;
use muchat_providers::chat::response::{ChatResponse, DirectionType};
use muchat_providers::chat::{self, utils};
use tokio::runtime::Runtime;

#[derive(Default)]
struct ChatInfo {
    name: String,
}

pub struct Application {
    state: bool,
    chat_info: ChatInfo,
    content: text_editor::Content,
    messages: Vec<String>,
    client: Option<chat::client::ChatClient>,
}

#[derive(Clone, Debug)]
pub enum Event {
    // InitializeClient,
    ClientInitialized(mpsc::Sender<Message>),
    ClientDisconnected,
    ClickOnChat { name: String },
    ContentChanged(text_editor::Action),
    SendMessage,
}

enum State<'a> {
    Disconnected,
    Connected((&'a ChatClient, mpsc::Receiver<Message>)),
}

#[derive(Debug, Clone)]
pub enum Message {
    Connected,
    Disconnected,
    User(String),
}

impl Application {
    pub fn initialize_client() -> Option<ChatClient> {
        let runtime = Runtime::new().expect("Failed to create Tokio runtime");
        let client = runtime.block_on(chat::client::ChatClient::new(
            "ws://localhost:5225".to_string(),
        ));
        client.ok()
    }

    pub fn new() -> (Self, Task<Event>) {
        (
            Self {
                state: false,
                chat_info: ChatInfo::default(),
                content: text_editor::Content::default(),
                messages: Vec::new(),
                client: None,
            },
            Task::batch([
                // Task::perform(Application::initialize_client(), |client| {
                //   Event::ClientInitialized(client)
                // }),
                widget::focus_next(),
            ]),
        )
    }

    pub fn update(&mut self, action: Event) -> Task<Event> {
        match action {
            // Event::InitializeClient => {
            //   Task::perform(Application::initialize_client(), Event::ClientInitialized)
            // }
            // Event::InitializeClient => Task::none(),
            Event::ClientInitialized(sender) => {
                println!("🟩 Client initialized");
                Task::none()
            }
            Event::ClientDisconnected => {
                self.client = None;
                Task::none()
            }
            Event::ClickOnChat { name } => {
                self.state = true;
                self.chat_info = ChatInfo { name };
                Task::none()
            }
            Event::ContentChanged(content) => {
                self.content.perform(content);
                Task::none()
            }
            Event::SendMessage => {
                self.messages.push(self.content.text());
                self.content = text_editor::Content::new();
                Task::none()
            }
        }
    }

    pub fn view(&self) -> Element<Event> {
        home(self)
    }

    pub fn subscription(&self) -> Subscription<Event> {
        Subscription::run(connect)
    }
}

pub fn connect() -> impl Stream<Item = Event> {
    stream::channel(100, |mut output| async move {
        let mut state = State::Disconnected;
        let client = Application::initialize_client();

        loop {
            match &mut state {
                State::Disconnected => match &client {
                    Some(client) => {
                        let (sender, receiver) = mpsc::channel::<Message>(100);
                        let _ = output.send(Event::ClientInitialized(sender)).await;
                        state = State::Connected((client, receiver));
                    }
                    None => {}
                },
                State::Connected((client, input)) => {
                    let stream_ref = client.stream.as_ref().unwrap();
                    let stream_lock = stream_ref.lock().await;
                    pin_mut!(stream_lock);

                    // let _ = client
                    //   .send_command(ChatCommand::CreateMyAddress.value().to_string(), None)
                    //   .await;
                    // client
                    // .send_command(ChatCommand::ShowActiveUser.value().to_string(), None)
                    // .await;

                    while let Some(response) = stream_lock.next().await {
                        println!("🟦 Received Message: {:?}", response);
                        match response {
                            Ok(message) => {
                                match message.resp {
                                    ChatResponse::NewChatItems { chat_items, .. } => {
                                        for item in chat_items {
                                            if let muchat_providers::chat::response::ChatInfo::Direct(c_info_direct) =
                      item.chat_info
                    {
                      match item.chat_item.chat_dir.direction_type {
                        DirectionType::DirectSnd => continue,
                        _ => {}
                      }

                      if let Some(content) = utils::extract_text_content(item.chat_item.content) {
                        let number: Result<f64, _> = content.parse();
                        let reply = match number {
                          Ok(n) => format!("{} * {} = {}", n, n, n * n),
                          Err(_) => "this is not a number".to_string(),
                        };

                        let _ = client
                          .send_text(
                            muchat_providers::chat::response::ChatInfoType::Direct,
                            c_info_direct.contact.contact_id.clone(),
                            reply,
                          )
                          .await;
                      }
                    }
                                        }
                                    }
                                    _ => {}
                                }
                            }
                            Err(_) => {}
                        }
                    }
                }
            }
        }
    })
}

fn home<'a>(app: &Application) -> Element<Event> {
    let name = "Bob";

    let sidebar = container(
        column![
            container(text("Chats").size(20))
                .align_x(Center)
                .align_y(Center)
                .height(48)
                .width(Fill),
            container(horizontal_rule(0.5)),
            mouse_area(
                container(column![text(name)].spacing(4).padding(left(48)).width(Fill)).padding(
                    Padding {
                        top: 16.,
                        bottom: 16.,
                        ..Default::default()
                    }
                )
            )
            .on_press(Event::ClickOnChat {
                name: name.to_string(),
            }),
            container(horizontal_rule(0.5))
        ]
        .width(300),
    );

    let main_content = if !app.state {
        column![container(text("No selected chat"))
            .align_x(Center)
            .align_y(Center)
            .width(Fill)
            .height(Fill)]
    } else {
        let test_input = text_editor(&app.content)
            .placeholder("Type your message here...")
            .on_action(Event::ContentChanged)
            .padding(10)
            .style(move |theme, status| Style {
                border: Border::default(),
                ..text_editor::default(theme, status)
            })
            .key_binding(|key_press| {
                let modifiers = key_press.modifiers;

                match text_editor::Binding::from_key_press(key_press) {
                    Some(text_editor::Binding::Enter) if !modifiers.shift() => {
                        Some(text_editor::Binding::Custom(Event::SendMessage))
                    }
                    binding => binding,
                }
            });

        let message_history = app.messages.iter().map(message_buble);

        column![
            container(text(format!("{}'s chat", app.chat_info.name)).size(20))
                .padding(left(16))
                .align_y(Center)
                .height(48)
                .width(Fill),
            horizontal_rule(0.5),
            scrollable(column(message_history).spacing(10).padding([10, 16]))
                .height(Length::Fill)
                .width(Length::Fill),
            horizontal_rule(0.5),
            container(test_input).padding(10)
        ]
        .into()
    };

    column![row![sidebar, vertical_rule(0.5), main_content]].into()
}

fn message_buble(message: &String) -> Element<Event> {
    let bubble = container(column![
        text("Me")
            .font(Font {
                weight: iced::font::Weight::Semibold,
                ..Default::default()
            })
            .style(|theme| TextStyle {
                ..text::secondary(theme)
            }),
        text(message).color(color!(120, 253, 255))
    ]);

    Element::from(bubble)
}
