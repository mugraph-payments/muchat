use iced::padding::left;
use iced::widget::text::Style as TextStyle;
use iced::widget::text_input::Style;
use iced::widget::{
    column, container, horizontal_rule, mouse_area, row, scrollable, text, text_input,
    vertical_rule,
};
use iced::Alignment::Center;
use iced::Length::{self, Fill};
use iced::{color, Border, Element, Font, Padding};

#[derive(Default)]
struct ChatInfo {
    name: String,
}

#[derive(Default)]
pub struct Application {
    state: bool,
    chat_info: ChatInfo,
    content: String,
    messages: Vec<String>,
}

#[derive(Debug, Clone)]
pub enum Event {
    ClickOnChat { name: String },
    ContentChanged(String),
    SendMessage,
}

impl Application {
    pub fn update(&mut self, action: Event) {
        match action {
            Event::ClickOnChat { name } => {
                self.state = true;
                self.chat_info = ChatInfo { name };
            }
            Event::ContentChanged(message) => {
                self.content = message.clone();
            }
            Event::SendMessage => {
                self.messages.push(self.content.clone());
            }
        }
    }

    pub fn view(&self) -> Element<Event> {
        home(self)
    }

    pub fn theme(&self) -> iced::Theme {
        iced::Theme::CatppuccinMocha
    }
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

    let divider = container(vertical_rule(0.5)).height(Fill);

    let main_content = if !app.state {
        column![container(text("No selected chat"))
            .align_x(Center)
            .align_y(Center)
            .width(Fill)
            .height(Fill)]
    } else {
        let input = text_input("Type something here...", &app.content)
            .id("chat_input")
            .style(move |theme, status| Style {
                border: Border::default(),
                ..text_input::default(theme, status)
            })
            .on_input(Event::ContentChanged)
            .on_submit(Event::SendMessage)
            .size(15)
            .padding(15)
            .width(Fill);

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
            container(input).padding(10)
        ]
        .into()
    };

    column![row![sidebar, divider, main_content]].into()
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
