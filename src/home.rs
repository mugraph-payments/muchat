use iced::{
    color,
    padding::left,
    widget::{
        column,
        container,
        horizontal_rule,
        mouse_area,
        row,
        scrollable,
        text,
        text::Style as TextStyle,
        text_editor,
        text_editor::Style,
        vertical_rule,
    },
    Alignment::Center,
    Border,
    Element,
    Font,
    Length::{self, Fill},
    Padding,
};

#[derive(Default)]
struct ChatInfo {
    name: String,
}

#[derive(Default)]
pub struct Application {
    state: bool,
    chat_info: ChatInfo,
    content: text_editor::Content,
    messages: Vec<String>,
}

#[derive(Debug, Clone)]
pub enum Event {
    ClickOnChat { name: String },
    ContentChanged(text_editor::Action),
    SendMessage,
}

impl Application {
    pub fn update(&mut self, action: Event) {
        match action {
            Event::ClickOnChat { name } => {
                self.state = true;
                self.chat_info = ChatInfo { name };
            }
            Event::ContentChanged(content) => {
                self.content.perform(content);
            }
            Event::SendMessage => {
                self.messages.push(self.content.text());
                self.content = text_editor::Content::new();
            }
        }
    }

    pub fn view(&self) -> Element<Event> {
        home(self)
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
