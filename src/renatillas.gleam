import clique
import clique/background
import clique/transform.{type Transform}
import gleam/int
import gleam/list
import gleam/option.{type Option, None}
import gleam/string
import lustre
import lustre/attribute.{class}
import lustre/element.{text}
import lustre/element/html.{body, button, div, head, html, p, span, title}
import lustre/event
import plinth/javascript/date
import plinth/javascript/global
import renatillas/window.{
  type Window, type WindowAction, About, Closed, Dancing, Doom, Email, Header,
  Homer, Libraries, Maximized, Minimized, Sites, Skull, Visible, Window,
  WindowPosition,
}

@external(javascript, "./renatillas.ffi.mjs", "initializeTouchSupport")
fn initialize_touch_support() -> Nil

@external(javascript, "./renatillas.ffi.mjs", "initializeViewTransitions")
fn initialize_view_transitions() -> Nil

pub fn main() -> Nil {
  let assert Ok(_) = clique.register()
  initialize_touch_support()
  initialize_view_transitions()
  let app = lustre.simple(init, update, view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)

  Nil
}

pub type Model {
  Model(
    transform: Transform,
    window_states: List(window.Window),
    start_menu_visible: Bool,
    current_time: String,
    timer_id: Option(global.TimerID),
  )
}

pub type Msg {
  UserDraggedWindow(window: window.Window)
  UserActivatedWindowControl(name: window.WindowName, action: WindowAction)
  UserClickedWindow(name: window.WindowName)
  RestoreWindow(window.Window)
  ToggleStartMenu
  UpdateTime
  ViewportPanned(Transform)
}

fn format_time() -> String {
  let now = date.now()
  let hours = date.hours(now)
  let minutes =
    date.minutes(now)
    |> int.to_string
    |> string.pad_start(2, "0")
  hours |> int.to_string() <> ":" <> minutes
}

fn init(_flags) -> Model {
  Model(
    transform: #(0.0, 0.0, 0.8),
    window_states: [
      Window(Header, Visible, WindowPosition(x: 750.0, y: 350.0)),
      Window(Doom, Visible, WindowPosition(x: 50.0, y: 50.0)),
      Window(Sites, Visible, WindowPosition(x: 400.0, y: 30.0)),
      Window(Skull, Visible, WindowPosition(x: 1350.0, y: 50.0)),
      Window(Email, Visible, WindowPosition(x: 1500.0, y: 200.0)),
      Window(About, Visible, WindowPosition(x: 50.0, y: 350.0)),
      Window(Libraries, Visible, WindowPosition(x: 50.0, y: 700.0)),
      Window(Homer, Visible, WindowPosition(x: 1200.0, y: 450.0)),
      Window(Dancing, Visible, WindowPosition(x: 1400.0, y: 650.0)),
    ],
    start_menu_visible: False,
    current_time: format_time(),
    timer_id: None,
  )
}

fn update(model: Model, msg: Msg) -> Model {
  case msg {
    UserDraggedWindow(Window(name, state, position)) -> {
      let new_window = Window(name, state, position)
      let old_windows =
        list.filter(model.window_states, fn(w) { w.name != name })
      Model(..model, window_states: [new_window, ..old_windows])
    }
    UserClickedWindow(name) -> {
      let assert Ok(clicked_window) =
        list.find(model.window_states, fn(w) { w.name == name })
      let other_windows =
        list.filter(model.window_states, fn(w) { w.name != name })
      Model(..model, window_states: [clicked_window, ..other_windows])
    }
    UserActivatedWindowControl(name, action) -> {
      case action {
        window.Minimize -> {
          let assert Ok(old_window) =
            list.find(model.window_states, fn(w) { w.name == name })
          let new_window = Window(name, Minimized, old_window.position)
          let old_windows =
            list.filter(model.window_states, fn(w) { w.name != name })
          Model(..model, window_states: [new_window, ..old_windows])
        }
        window.Maximize -> {
          let assert Ok(old_window) =
            list.find(model.window_states, fn(w) { w.name == name })
          let is_maximizing = old_window.state != Maximized
          let new_window =
            Window(
              name,
              case old_window.state {
                Maximized -> Visible
                _ -> Maximized
              },
              old_window.position,
            )
          let old_windows =
            list.filter(model.window_states, fn(w) { w.name != name })
          // Reset viewport transform when maximizing to ensure window covers screen
          let new_transform = case is_maximizing {
            True -> #(0.0, 0.0, 1.0)
            False -> model.transform
          }
          Model(
            ..model,
            window_states: [new_window, ..old_windows],
            transform: new_transform,
          )
        }
        window.Close -> {
          let assert Ok(old_window) =
            list.find(model.window_states, fn(w) { w.name == name })
          let new_window = Window(name, Closed, old_window.position)
          let old_windows =
            list.filter(model.window_states, fn(w) { w.name != name })
          Model(..model, window_states: [new_window, ..old_windows])
        }
      }
    }
    RestoreWindow(Window(name, _, position)) -> {
      let new_window = Window(name, Visible, position)
      let old_windows =
        list.filter(model.window_states, fn(w) { w.name != name })
      Model(..model, window_states: [new_window, ..old_windows])
    }
    ViewportPanned(transform) -> {
      Model(..model, transform: transform)
    }
    ToggleStartMenu -> {
      Model(..model, start_menu_visible: !model.start_menu_visible)
    }
    UpdateTime -> {
      Model(..model, current_time: format_time())
    }
  }
}

fn view(model: Model) -> element.Element(Msg) {
  html([], [
    head([], [
      title([], "renata amutio - gleam developer"),
    ]),
    body(
      [
        class(
          "min-h-screen bg-[#008080] font-['MS_Sans_Serif'] text-black overflow-x-hidden",
        ),
      ],
      [
        // CRT noise overlay for full chaos mode
        div([class("crt-noise")], []),
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
              list.map(list.reverse(model.window_states), fn(window) {
                create_window_element(window)
              }),
            ),
          ],
        ),
        // Start menu dropdown
        case model.start_menu_visible {
          True ->
            div(
              [
                class(
                  "fixed bottom-12 left-2 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] shadow-lg z-50 min-w-48 max-h-64 overflow-y-auto animate-menu-appear",
                ),
                attribute.attribute("data-start-menu", "true"),
              ],
              [
                div(
                  [
                    class(
                      "p-2 border-b border-[#808080] bg-gradient-to-r from-[#000080] to-[#0000ff] text-white text-sm font-bold",
                    ),
                  ],
                  [
                    text("Closed Applications"),
                  ],
                ),
                div([class("p-1")], get_closed_windows(model.window_states)),
              ],
            )
          False -> div([], [])
        },
        task_bar(model),
      ],
    ),
  ])
}

fn create_window_element(window: Window) -> #(String, element.Element(Msg)) {
  case window {
    Window(_, Closed, _) | Window(_, Minimized, _) -> #("", div([], []))
    Window(name, state, _) -> {
      #(
        window.name_to_string(name),
        window.create_window_with_content(
          window,
          fn(x, y) {
            UserDraggedWindow(Window(name, state, WindowPosition(x, y)))
          },
          fn(action) { UserActivatedWindowControl(name, action) },
          fn() { UserClickedWindow(name) },
          case name {
            Email -> window.email_content()
            Skull -> window.skull_content()
            Header -> window.header_content()
            About -> window.about_content()
            Libraries -> window.libraries_content()
            Sites -> window.sites_content()
            Homer -> window.homer_content()
            Dancing -> window.dancing_content()
            Doom -> window.doom_content()
          },
        ),
      )
    }
  }
}

fn get_closed_windows(window_states: List(Window)) -> List(element.Element(Msg)) {
  let windows = list.filter(window_states, fn(w) { w.state == Closed })
  list.map(windows, fn(w) {
    create_taskbar_button(
      window.name_to_string(w.name),
      window.name_to_icon(w.name),
      w,
    )
  })
}

fn task_bar(model: Model) {
  div(
    [
      class(
        "fixed max-h-12 bottom-0 left-0 right-0 bg-[#c0c0c0] border-t-2 border-t-white p-2 flex items-center justify-between z-50",
      ),
    ],
    [
      div([class("flex items-center gap-2")], [
        button(
          [
            class(
              "bg-[#008000] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] px-3 py-1 flex items-center gap-2 text-white font-bold text-sm hover:bg-[#009000] active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white",
            ),
            attribute.attribute("data-start-button", "true"),
            event.on_click(ToggleStartMenu),
          ],
          [span([class("text-lg")], [text("🟢")]), text("Start")],
        ),
        ..get_minimized_windows(model.window_states)
      ]),
      div([class("flex-1 text-center marquee-container overflow-hidden")], [
        p([class("marquee text-black text-xs font-bold chromatic")], [
          text("✦ BUILT WITH ♥ GLEAM ✦ Y2K FOREVER ✦ FUNCTIONAL PROGRAMMING IS THE FUTURE ✦ HELLO FROM THE PAST ✦ WELCOME TO MY DIGITAL SPACE ✦"),
        ]),
      ]),
      div(
        [
          class(
            "bg-[#008080] border border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#404040] border-b-[#404040] px-2 py-1 text-white text-xs font-bold",
          ),
        ],
        [text(model.current_time)],
      ),
    ],
  )
}

fn get_minimized_windows(
  window_states: List(Window),
) -> List(element.Element(Msg)) {
  let windows = list.filter(window_states, fn(w) { w.state == Minimized })
  list.map(windows, fn(w) {
    create_taskbar_button(
      window.name_to_string(w.name),
      window.name_to_icon(w.name),
      w,
    )
  })
}

fn create_taskbar_button(
  title: String,
  icon: String,
  window: Window,
) -> element.Element(Msg) {
  button(
    [
      class(
        "bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-2 py-1 text-black text-xs font-bold hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white max-w-32 truncate",
      ),
      attribute.attribute("data-minimized-window", "true"),
      attribute.attribute("data-taskbar-button", "true"),
      event.on_click(RestoreWindow(window)),
    ],
    [span([class("mr-1")], [text(icon)]), text(title)],
  )
}
