use home::Application;
use iced::Theme;

mod home;

pub fn main() -> iced::Result {
    iced::application("muchat", Application::update, Application::view)
        .theme(|_| Theme::CatppuccinMocha)
        .run()
}