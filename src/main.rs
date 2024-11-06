use home::Application;

mod home;

pub fn main() -> iced::Result {
    iced::application("muchat", Application::update, Application::view)
        .theme(Application::theme)
        .run()
}