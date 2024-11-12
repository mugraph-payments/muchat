use home::Application;

mod home;

fn main() -> iced::Result {
    iced::application("Muchat", Application::update, Application::view)
        .subscription(Application::subscription)
        .run_with(Application::new)
}
