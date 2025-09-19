import clique
import clique/background
import clique/transform.{type Transform}
import lustre
import lustre/attribute.{class, href, rel}
import lustre/element.{text}
import lustre/element/html.{body, button, div, head, html, link, p, span, title}
import lustre/event
import renatillas/touch
import renatillas/window.{type WindowAction, type WindowPosition, WindowPosition}

pub fn main() -> Nil {
  let assert Ok(_) = clique.register()
  touch.initialize_touch_support()
  let app = lustre.simple(init, update, view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)

  Nil
}

pub type WindowState {
  Visible
  Minimized
  Maximized
  Closed
}

pub type Model {
  Model(
    email_window: WindowPosition,
    skull_window: WindowPosition,
    homer_window: WindowPosition,
    header_window: WindowPosition,
    about_window: WindowPosition,
    libraries_window: WindowPosition,
    sites_window: WindowPosition,
    dancing_window: WindowPosition,
    transform: Transform,
    z_index_counter: Int,
    window_z_indexes: #(Int, Int, Int, Int, Int, Int, Int, Int),
    window_states: #(WindowState, WindowState, WindowState, WindowState, WindowState, WindowState, WindowState, WindowState),
  )
}


pub type Msg {
  EmailWindowDragged(x: Float, y: Float)
  SkullWindowDragged(x: Float, y: Float)
  HeaderWindowDragged(x: Float, y: Float)
  AboutWindowDragged(x: Float, y: Float)
  LibrariesWindowDragged(x: Float, y: Float)
  SitesWindowDragged(x: Float, y: Float)
  HomerWindowDragged(x: Float, y: Float)
  DancingWindowDragged(x: Float, y: Float)
  EmailWindowAction(WindowAction)
  SkullWindowAction(WindowAction)
  HeaderWindowAction(WindowAction)
  AboutWindowAction(WindowAction)
  LibrariesWindowAction(WindowAction)
  SitesWindowAction(WindowAction)
  HomerWindowAction(WindowAction)
  DancingWindowAction(WindowAction)
  RestoreWindow(String)
  ViewportPanned(Transform)
}

fn init(_flags) -> Model {
  Model(
    email_window: WindowPosition(x: 1200.0, y: 120.0),
    skull_window: WindowPosition(x: 1100.0, y: 10.0),
    header_window: WindowPosition(x: -10.0, y: 20.0),
    about_window: WindowPosition(x: 10.0, y: 320.0),
    libraries_window: WindowPosition(x: 0.0, y: 530.0),
    sites_window: WindowPosition(x: 450.0, y: 0.0),
    homer_window: WindowPosition(x: 600.0, y: 250.0),
    dancing_window: WindowPosition(x: 1200.0, y: 400.0),
    transform: #(0.0, 0.0, 0.8),
    z_index_counter: 8,
    window_z_indexes: #(1, 2, 3, 4, 5, 6, 7, 8),
    window_states: #(Visible, Visible, Visible, Visible, Visible, Visible, Visible, Visible),
  )
}

fn update(model: Model, msg: Msg) -> Model {
  case msg {
    EmailWindowDragged(x, y) -> {
      let new_z_index = model.z_index_counter + 1
      let #(
        _,
        skull_z,
        header_z,
        about_z,
        libraries_z,
        sites_z,
        homer_z,
        dancing_z,
      ) = model.window_z_indexes
      Model(
        ..model,
        email_window: WindowPosition(x: x, y: y),
        z_index_counter: new_z_index,
        window_z_indexes: #(
          new_z_index,
          skull_z,
          header_z,
          about_z,
          libraries_z,
          sites_z,
          homer_z,
          dancing_z,
        ),
      )
    }
    SkullWindowDragged(x, y) -> {
      let new_z_index = model.z_index_counter + 1
      let #(
        email_z,
        _,
        header_z,
        about_z,
        libraries_z,
        sites_z,
        homer_z,
        dancing_z,
      ) = model.window_z_indexes
      Model(
        ..model,
        skull_window: WindowPosition(x: x, y: y),
        z_index_counter: new_z_index,
        window_z_indexes: #(
          email_z,
          new_z_index,
          header_z,
          about_z,
          libraries_z,
          sites_z,
          homer_z,
          dancing_z,
        ),
      )
    }
    HeaderWindowDragged(x, y) -> {
      let new_z_index = model.z_index_counter + 1
      let #(
        email_z,
        skull_z,
        _,
        about_z,
        libraries_z,
        sites_z,
        homer_z,
        dancing_z,
      ) = model.window_z_indexes
      Model(
        ..model,
        header_window: WindowPosition(x: x, y: y),
        z_index_counter: new_z_index,
        window_z_indexes: #(
          email_z,
          skull_z,
          new_z_index,
          about_z,
          libraries_z,
          sites_z,
          homer_z,
          dancing_z,
        ),
      )
    }
    AboutWindowDragged(x, y) -> {
      let new_z_index = model.z_index_counter + 1
      let #(
        email_z,
        skull_z,
        header_z,
        _,
        libraries_z,
        sites_z,
        homer_z,
        dancing_z,
      ) = model.window_z_indexes
      Model(
        ..model,
        about_window: WindowPosition(x: x, y: y),
        z_index_counter: new_z_index,
        window_z_indexes: #(
          email_z,
          skull_z,
          header_z,
          new_z_index,
          libraries_z,
          sites_z,
          homer_z,
          dancing_z,
        ),
      )
    }
    LibrariesWindowDragged(x, y) -> {
      let new_z_index = model.z_index_counter + 1
      let #(email_z, skull_z, header_z, about_z, _, sites_z, homer_z, dancing_z) =
        model.window_z_indexes
      Model(
        ..model,
        libraries_window: WindowPosition(x: x, y: y),
        z_index_counter: new_z_index,
        window_z_indexes: #(
          email_z,
          skull_z,
          header_z,
          about_z,
          new_z_index,
          sites_z,
          homer_z,
          dancing_z,
        ),
      )
    }
    SitesWindowDragged(x, y) -> {
      let new_z_index = model.z_index_counter + 1
      let #(
        email_z,
        skull_z,
        header_z,
        about_z,
        libraries_z,
        _,
        homer_z,
        dancing_z,
      ) = model.window_z_indexes
      Model(
        ..model,
        sites_window: WindowPosition(x: x, y: y),
        z_index_counter: new_z_index,
        window_z_indexes: #(
          email_z,
          skull_z,
          header_z,
          about_z,
          libraries_z,
          new_z_index,
          homer_z,
          dancing_z,
        ),
      )
    }
    HomerWindowDragged(x, y) -> {
      let new_z_index = model.z_index_counter + 1
      let #(
        email_z,
        skull_z,
        header_z,
        about_z,
        libraries_z,
        sites_z,
        _,
        dancing_z,
      ) = model.window_z_indexes
      Model(
        ..model,
        homer_window: WindowPosition(x: x, y: y),
        z_index_counter: new_z_index,
        window_z_indexes: #(
          email_z,
          skull_z,
          header_z,
          about_z,
          libraries_z,
          sites_z,
          new_z_index,
          dancing_z,
        ),
      )
    }
    DancingWindowDragged(x, y) -> {
      let new_z_index = model.z_index_counter + 1
      let #(
        email_z,
        skull_z,
        header_z,
        about_z,
        libraries_z,
        sites_z,
        homer_z,
        _,
      ) = model.window_z_indexes
      Model(
        ..model,
        dancing_window: WindowPosition(x: x, y: y),
        z_index_counter: new_z_index,
        window_z_indexes: #(
          email_z,
          skull_z,
          header_z,
          about_z,
          libraries_z,
          sites_z,
          homer_z,
          new_z_index,
        ),
      )
    }
    ViewportPanned(transform) -> {
      Model(..model, transform: transform)
    }
    EmailWindowAction(window.Minimize) -> {
      let #(_, skull_s, header_s, about_s, libraries_s, sites_s, homer_s, dancing_s) = model.window_states
      Model(..model, window_states: #(Minimized, skull_s, header_s, about_s, libraries_s, sites_s, homer_s, dancing_s))
    }
    EmailWindowAction(window.Maximize) -> {
      let #(email_s, skull_s, header_s, about_s, libraries_s, sites_s, homer_s, dancing_s) = model.window_states
      let new_state = case email_s {
        Maximized -> Visible
        _ -> Maximized
      }
      Model(..model, window_states: #(new_state, skull_s, header_s, about_s, libraries_s, sites_s, homer_s, dancing_s))
    }
    EmailWindowAction(window.Close) -> {
      let #(_, skull_s, header_s, about_s, libraries_s, sites_s, homer_s, dancing_s) = model.window_states
      Model(..model, window_states: #(Closed, skull_s, header_s, about_s, libraries_s, sites_s, homer_s, dancing_s))
    }
    SkullWindowAction(window.Minimize) -> {
      let #(email_s, _, header_s, about_s, libraries_s, sites_s, homer_s, dancing_s) = model.window_states
      Model(..model, window_states: #(email_s, Minimized, header_s, about_s, libraries_s, sites_s, homer_s, dancing_s))
    }
    SkullWindowAction(window.Maximize) -> {
      let #(email_s, skull_s, header_s, about_s, libraries_s, sites_s, homer_s, dancing_s) = model.window_states
      let new_state = case skull_s {
        Maximized -> Visible
        _ -> Maximized
      }
      Model(..model, window_states: #(email_s, new_state, header_s, about_s, libraries_s, sites_s, homer_s, dancing_s))
    }
    SkullWindowAction(window.Close) -> {
      let #(email_s, _, header_s, about_s, libraries_s, sites_s, homer_s, dancing_s) = model.window_states
      Model(..model, window_states: #(email_s, Closed, header_s, about_s, libraries_s, sites_s, homer_s, dancing_s))
    }
    HeaderWindowAction(window.Minimize) -> {
      let #(email_s, skull_s, _, about_s, libraries_s, sites_s, homer_s, dancing_s) = model.window_states
      Model(..model, window_states: #(email_s, skull_s, Minimized, about_s, libraries_s, sites_s, homer_s, dancing_s))
    }
    HeaderWindowAction(window.Maximize) -> {
      let #(email_s, skull_s, header_s, about_s, libraries_s, sites_s, homer_s, dancing_s) = model.window_states
      let new_state = case header_s {
        Maximized -> Visible
        _ -> Maximized
      }
      Model(..model, window_states: #(email_s, skull_s, new_state, about_s, libraries_s, sites_s, homer_s, dancing_s))
    }
    HeaderWindowAction(window.Close) -> {
      let #(email_s, skull_s, _, about_s, libraries_s, sites_s, homer_s, dancing_s) = model.window_states
      Model(..model, window_states: #(email_s, skull_s, Closed, about_s, libraries_s, sites_s, homer_s, dancing_s))
    }
    AboutWindowAction(window.Minimize) -> {
      let #(email_s, skull_s, header_s, _, libraries_s, sites_s, homer_s, dancing_s) = model.window_states
      Model(..model, window_states: #(email_s, skull_s, header_s, Minimized, libraries_s, sites_s, homer_s, dancing_s))
    }
    AboutWindowAction(window.Maximize) -> {
      let #(email_s, skull_s, header_s, about_s, libraries_s, sites_s, homer_s, dancing_s) = model.window_states
      let new_state = case about_s {
        Maximized -> Visible
        _ -> Maximized
      }
      Model(..model, window_states: #(email_s, skull_s, header_s, new_state, libraries_s, sites_s, homer_s, dancing_s))
    }
    AboutWindowAction(window.Close) -> {
      let #(email_s, skull_s, header_s, _, libraries_s, sites_s, homer_s, dancing_s) = model.window_states
      Model(..model, window_states: #(email_s, skull_s, header_s, Closed, libraries_s, sites_s, homer_s, dancing_s))
    }
    LibrariesWindowAction(window.Minimize) -> {
      let #(email_s, skull_s, header_s, about_s, _, sites_s, homer_s, dancing_s) = model.window_states
      Model(..model, window_states: #(email_s, skull_s, header_s, about_s, Minimized, sites_s, homer_s, dancing_s))
    }
    LibrariesWindowAction(window.Maximize) -> {
      let #(email_s, skull_s, header_s, about_s, libraries_s, sites_s, homer_s, dancing_s) = model.window_states
      let new_state = case libraries_s {
        Maximized -> Visible
        _ -> Maximized
      }
      Model(..model, window_states: #(email_s, skull_s, header_s, about_s, new_state, sites_s, homer_s, dancing_s))
    }
    LibrariesWindowAction(window.Close) -> {
      let #(email_s, skull_s, header_s, about_s, _, sites_s, homer_s, dancing_s) = model.window_states
      Model(..model, window_states: #(email_s, skull_s, header_s, about_s, Closed, sites_s, homer_s, dancing_s))
    }
    SitesWindowAction(window.Minimize) -> {
      let #(email_s, skull_s, header_s, about_s, libraries_s, _, homer_s, dancing_s) = model.window_states
      Model(..model, window_states: #(email_s, skull_s, header_s, about_s, libraries_s, Minimized, homer_s, dancing_s))
    }
    SitesWindowAction(window.Maximize) -> {
      let #(email_s, skull_s, header_s, about_s, libraries_s, sites_s, homer_s, dancing_s) = model.window_states
      let new_state = case sites_s {
        Maximized -> Visible
        _ -> Maximized
      }
      Model(..model, window_states: #(email_s, skull_s, header_s, about_s, libraries_s, new_state, homer_s, dancing_s))
    }
    SitesWindowAction(window.Close) -> {
      let #(email_s, skull_s, header_s, about_s, libraries_s, _, homer_s, dancing_s) = model.window_states
      Model(..model, window_states: #(email_s, skull_s, header_s, about_s, libraries_s, Closed, homer_s, dancing_s))
    }
    HomerWindowAction(window.Minimize) -> {
      let #(email_s, skull_s, header_s, about_s, libraries_s, sites_s, _, dancing_s) = model.window_states
      Model(..model, window_states: #(email_s, skull_s, header_s, about_s, libraries_s, sites_s, Minimized, dancing_s))
    }
    HomerWindowAction(window.Maximize) -> {
      let #(email_s, skull_s, header_s, about_s, libraries_s, sites_s, homer_s, dancing_s) = model.window_states
      let new_state = case homer_s {
        Maximized -> Visible
        _ -> Maximized
      }
      Model(..model, window_states: #(email_s, skull_s, header_s, about_s, libraries_s, sites_s, new_state, dancing_s))
    }
    HomerWindowAction(window.Close) -> {
      let #(email_s, skull_s, header_s, about_s, libraries_s, sites_s, _, dancing_s) = model.window_states
      Model(..model, window_states: #(email_s, skull_s, header_s, about_s, libraries_s, sites_s, Closed, dancing_s))
    }
    DancingWindowAction(window.Minimize) -> {
      let #(email_s, skull_s, header_s, about_s, libraries_s, sites_s, homer_s, _) = model.window_states
      Model(..model, window_states: #(email_s, skull_s, header_s, about_s, libraries_s, sites_s, homer_s, Minimized))
    }
    DancingWindowAction(window.Maximize) -> {
      let #(email_s, skull_s, header_s, about_s, libraries_s, sites_s, homer_s, dancing_s) = model.window_states
      let new_state = case dancing_s {
        Maximized -> Visible
        _ -> Maximized
      }
      Model(..model, window_states: #(email_s, skull_s, header_s, about_s, libraries_s, sites_s, homer_s, new_state))
    }
    DancingWindowAction(window.Close) -> {
      let #(email_s, skull_s, header_s, about_s, libraries_s, sites_s, homer_s, _) = model.window_states
      Model(..model, window_states: #(email_s, skull_s, header_s, about_s, libraries_s, sites_s, homer_s, Closed))
    }
    RestoreWindow(window_id) -> {
      let #(email_s, skull_s, header_s, about_s, libraries_s, sites_s, homer_s, dancing_s) = model.window_states
      case window_id {
        "email" -> Model(..model, window_states: #(Visible, skull_s, header_s, about_s, libraries_s, sites_s, homer_s, dancing_s))
        "skull" -> Model(..model, window_states: #(email_s, Visible, header_s, about_s, libraries_s, sites_s, homer_s, dancing_s))
        "header" -> Model(..model, window_states: #(email_s, skull_s, Visible, about_s, libraries_s, sites_s, homer_s, dancing_s))
        "about" -> Model(..model, window_states: #(email_s, skull_s, header_s, Visible, libraries_s, sites_s, homer_s, dancing_s))
        "libraries" -> Model(..model, window_states: #(email_s, skull_s, header_s, about_s, Visible, sites_s, homer_s, dancing_s))
        "sites" -> Model(..model, window_states: #(email_s, skull_s, header_s, about_s, libraries_s, Visible, homer_s, dancing_s))
        "homer" -> Model(..model, window_states: #(email_s, skull_s, header_s, about_s, libraries_s, sites_s, Visible, dancing_s))
        "dancing" -> Model(..model, window_states: #(email_s, skull_s, header_s, about_s, libraries_s, sites_s, homer_s, Visible))
        _ -> model
      }
    }
  }
}

fn create_taskbar_button(title: String, icon: String, window_id: String) -> element.Element(Msg) {
  button(
    [
      class(
        "bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-2 py-1 text-black text-xs font-bold hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white max-w-32 truncate",
      ),
      event.on_click(RestoreWindow(window_id)),
    ],
    [span([class("mr-1")], [text(icon)]), text(title)],
  )
}

fn get_minimized_windows(window_states: #(WindowState, WindowState, WindowState, WindowState, WindowState, WindowState, WindowState, WindowState)) -> List(element.Element(Msg)) {
  let #(email_state, skull_state, header_state, about_state, libraries_state, sites_state, homer_state, dancing_state) = window_states
  let windows = []
  
  let windows = case email_state {
    Minimized -> [create_taskbar_button("email.gif", "📧", "email"), ..windows]
    _ -> windows
  }
  
  let windows = case skull_state {
    Minimized -> [create_taskbar_button("skull.gif", "💀", "skull"), ..windows]
    _ -> windows
  }
  
  let windows = case header_state {
    Minimized -> [create_taskbar_button("Portfolio", "R", "header"), ..windows]
    _ -> windows
  }
  
  let windows = case about_state {
    Minimized -> [create_taskbar_button("About Me", "?", "about"), ..windows]
    _ -> windows
  }
  
  let windows = case libraries_state {
    Minimized -> [create_taskbar_button("Libraries", "📁", "libraries"), ..windows]
    _ -> windows
  }
  
  let windows = case sites_state {
    Minimized -> [create_taskbar_button("Sites", "🌐", "sites"), ..windows]
    _ -> windows
  }
  
  let windows = case homer_state {
    Minimized -> [create_taskbar_button("homer.gif", "🎵", "homer"), ..windows]
    _ -> windows
  }
  
  let windows = case dancing_state {
    Minimized -> [create_taskbar_button("dancing.gif", "💃", "dancing"), ..windows]
    _ -> windows
  }
  
  windows
}

fn view(model: Model) -> element.Element(Msg) {
  html([], [
    head([], [
      title([], "renata amutio - gleam developer"),
      link([
        rel("stylesheet"),
        href(
          "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap",
        ),
      ]),
    ]),
    body(
      [
        class(
          "min-h-screen bg-[#008080] font-['MS_Sans_Serif'] text-black overflow-x-hidden",
        ),
      ],
      [
        clique.root(
          [
            class("w-full h-full absolute inset-0 clique-root"),
            attribute.attribute("data-clique-root", "true"),
            clique.transform(model.transform),
            clique.on_pan(ViewportPanned),
            clique.on_zoom(ViewportPanned),
          ],
          [
            clique.background([
              background.lines(),
              class("text-gray-200/20"),
              background.gap(50.0, 50.0),
            ]),
            clique.nodes(
              case model.window_states {
                #(email_state, skull_state, header_state, about_state, libraries_state, sites_state, homer_state, dancing_state) ->
                  [
                    case email_state {
                      Closed -> #("email-window", div([], []))
                      Minimized -> #("email-window", div([], []))
                      _ -> #(
                        "email-window",
                        window.email_window(
                          model.email_window,
                          model.window_z_indexes.0,
                          EmailWindowDragged,
                          EmailWindowAction,
                          email_state == Maximized,
                        ),
                      )
                    },
                    case skull_state {
                      Closed -> #("skull-window", div([], []))
                      Minimized -> #("skull-window", div([], []))
                      _ -> #(
                        "skull-window",
                        window.skull_window(
                          model.skull_window,
                          model.window_z_indexes.1,
                          SkullWindowDragged,
                          SkullWindowAction,
                          skull_state == Maximized,
                        ),
                      )
                    },
                    case header_state {
                      Closed -> #("header-window", div([], []))
                      Minimized -> #("header-window", div([], []))
                      _ -> #(
                        "header-window",
                        window.header_window(
                          model.header_window,
                          model.window_z_indexes.2,
                          HeaderWindowDragged,
                          HeaderWindowAction,
                          header_state == Maximized,
                        ),
                      )
                    },
                    case about_state {
                      Closed -> #("about-window", div([], []))
                      Minimized -> #("about-window", div([], []))
                      _ -> #(
                        "about-window",
                        window.about_window(
                          model.about_window,
                          model.window_z_indexes.3,
                          AboutWindowDragged,
                          AboutWindowAction,
                          about_state == Maximized,
                        ),
                      )
                    },
                    case libraries_state {
                      Closed -> #("libraries-window", div([], []))
                      Minimized -> #("libraries-window", div([], []))
                      _ -> #(
                        "libraries-window",
                        window.libraries_window(
                          model.libraries_window,
                          model.window_z_indexes.4,
                          LibrariesWindowDragged,
                          LibrariesWindowAction,
                          libraries_state == Maximized,
                        ),
                      )
                    },
                    case sites_state {
                      Closed -> #("sites-window", div([], []))
                      Minimized -> #("sites-window", div([], []))
                      _ -> #(
                        "sites-window",
                        window.sites_window(
                          model.sites_window,
                          model.window_z_indexes.5,
                          SitesWindowDragged,
                          SitesWindowAction,
                          sites_state == Maximized,
                        ),
                      )
                    },
                    case homer_state {
                      Closed -> #("homer-window", div([], []))
                      Minimized -> #("homer-window", div([], []))
                      _ -> #(
                        "homer-window",
                        window.homer_window(
                          model.homer_window,
                          model.window_z_indexes.6,
                          HomerWindowDragged,
                          HomerWindowAction,
                          homer_state == Maximized,
                        ),
                      )
                    },
                    case dancing_state {
                      Closed -> #("dancing-window", div([], []))
                      Minimized -> #("dancing-window", div([], []))
                      _ -> #(
                        "dancing-window",
                        window.dancing_window(
                          model.dancing_window,
                          model.window_z_indexes.7,
                          DancingWindowDragged,
                          DancingWindowAction,
                          dancing_state == Maximized,
                        ),
                      )
                    },
                  ]
              }
            ),
          ],
        ),
        // Simple footer taskbar - remove all the static content above this
        div(
          [
            class(
              "fixed max-h-12 bottom-0 left-0 right-0 bg-[#c0c0c0] border-t-2 border-t-white p-2 flex items-center justify-between z-50",
            ),
          ],
          [
            div([class("flex items-center gap-2")], 
              [
                div(
                  [
                    class(
                      "bg-[#008000] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] px-3 py-1 flex items-center gap-2 text-white font-bold text-sm",
                    ),
                  ],
                  [span([class("text-lg")], [text("🟢")]), text("Start")],
                ),
                ..get_minimized_windows(model.window_states)
              ]
            ),
            div([class("flex-1 text-center")], [
              p([class("text-black text-xs font-bold")], [
                text("BUILT WITH ♥ GLEAM"),
              ]),
            ]),
            div(
              [
                class(
                  "bg-[#008080] border border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#404040] border-b-[#404040] px-2 py-1 text-white text-xs font-bold",
                ),
              ],
              [text("12:00 AM")],
            ),
          ],
        ),
      ],
    ),
  ])
}
