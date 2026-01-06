import clique
import clique/node
import lustre/attribute.{alt, class, href, src, target}
import lustre/element.{type Element}
import lustre/element/html.{a, button, div, h1, h3, img, p, span, text}
import lustre/event

pub type WindowAction {
  Minimize
  Maximize
  Close
}

pub type Window {
  Window(name: WindowName, state: WindowState, position: WindowPosition)
}

pub type WindowName {
  Email
  Skull
  Header
  About
  Libraries
  Sites
  Homer
  Dancing
  Doom
}

pub type WindowState {
  Visible
  Minimized
  Maximized
  Closed
}

pub type WindowConfig(msg) {
  WindowConfig(
    id: String,
    title: String,
    icon: String,
    position: #(Float, Float),
    on_drag: fn(Float, Float) -> msg,
    on_action: fn(WindowAction) -> msg,
    on_click: fn() -> msg,
    content: Element(msg),
    width: String,
    is_maximized: Bool,
  )
}

fn create_window(config: WindowConfig(msg)) -> Element(msg) {
  clique.node(
    config.id,
    [
      node.position(
        case config.is_maximized {
          True -> #(0.0, 0.0)
          False -> config.position
        }.0,
        case config.is_maximized {
          True -> #(0.0, 0.0)
          False -> config.position
        }.1,
      ),
      node.on_drag(case config.is_maximized {
        True -> fn(_, _, _, _, _) {
          config.on_drag(config.position.0, config.position.1)
        }
        False -> fn(_, x, y, _, _) { config.on_drag(x, y) }
      }),
      class(case config.is_maximized {
        True -> "select-none"
        False -> "select-none touch-draggable"
      }),
      attribute.attribute("data-window", config.id),
    ],
    [
      div(
        [
          class(case config.is_maximized {
            True ->
              "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] maximized-window "
              <> config.width
            False ->
              "bg-[#c0c0c0] border-2 border-t-white max-w-sm border-l-white border-r-[#808080] border-b-[#808080] animate-window-appear "
              <> config.width
          }),
          event.on_click(config.on_click()),
        ],
        [
          div(
            [
              class(
                "bg-gradient-to-r from-[#0000ff] to-[#000080] text-white px-2 py-1 flex items-center justify-between drag-handle",
              ),
            ],
            [
              div([class("flex items-center gap-2")], [
                div(
                  [
                    class(
                      "w-4 h-4 bg-[#c0c0c0] border border-[#808080] flex items-center justify-center text-xs text-black font-bold",
                    ),
                  ],
                  [text(config.icon)],
                ),
                span([class("font-bold text-sm pr-10 ")], [text(config.title)]),
              ]),
              create_window_controls(config.on_action, config.is_maximized),
            ],
          ),
          config.content,
        ],
      ),
    ],
  )
}

fn create_window_controls(
  on_action: fn(WindowAction) -> msg,
  is_maximized: Bool,
) -> Element(msg) {
  div([class("flex gap-1")], [
    button(
      [
        class(
          "w-5 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs flex items-center justify-center text-black font-bold hover:bg-[#ffffff] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white window-control-btn",
        ),
        attribute.attribute("data-window-button", "minimize"),
        node.nodrag(),
        event.on_click(on_action(Minimize)),
      ],
      [text("_")],
    ),
    button(
      [
        class(
          "w-5 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs flex items-center justify-center text-black font-bold hover:bg-[#ffffff] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white window-control-btn",
        ),
        attribute.attribute("data-window-button", "maximize"),
        node.nodrag(),
        event.on_click(on_action(Maximize)),
      ],
      [
        text(case is_maximized {
          True -> "❐"
          False -> "□"
        }),
      ],
    ),
    button(
      [
        class(
          "w-5 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs flex items-center justify-center text-black font-bold hover:bg-[#ffffff] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white window-control-btn",
        ),
        attribute.attribute("data-window-button", "close"),
        node.nodrag(),
        event.on_click(on_action(Close)),
      ],
      [text("×")],
    ),
  ])
}

pub type WindowPosition {
  WindowPosition(x: Float, y: Float)
}

pub fn email_content() -> Element(msg) {
  div(
    [
      class(
        "p-2 bg-[#c0c0c0] border border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#404040] border-b-[#404040] m-1",
      ),
    ],
    [
      img([
        src("email.gif"),
        alt("Email animation"),
        class("w-24 h-24 pixelated"),
      ]),
    ],
  )
}

pub fn dancing_content() -> Element(msg) {
  div(
    [
      class(
        "p-2 bg-[#c0c0c0] border border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#404040] border-b-[#404040] m-1",
      ),
    ],
    [
      img([
        src("dancing.gif"),
        alt("Dancing animation"),
        class("w-24 h-24 pixelated"),
      ]),
    ],
  )
}

pub fn homer_content() -> Element(msg) {
  div(
    [
      class(
        "bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-1",
      ),
    ],
    [
      img([
        src("homer.gif"),
        alt("Homer Simpson"),
        class("pixelated bg-white"),
      ]),
    ],
  )
}

pub fn skull_content() -> Element(msg) {
  div(
    [
      class(
        "p-2 bg-[#c0c0c0] border border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#404040] border-b-[#404040] m-1",
      ),
    ],
    [
      img([
        src("skull.gif"),
        alt("Skull animation"),
        class("w-20 h-20 pixelated"),
      ]),
    ],
  )
}

pub fn header_content() -> Element(msg) {
  div(
    [
      class(
        "p-6 text-center bg-[#ffffff] border border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#404040] border-b-[#404040] m-2",
      ),
    ],
    [
      h1([class("text-4xl font-bold text-[#000080] mb-2")], [
        text("RENATA AMUTIO"),
      ]),
      p([class("text-lg text-black")], [
        text("GLEAM DEVELOPER • FUNCTIONAL PROGRAMMING ENTHUSIAST"),
      ]),
      div(
        [
          class(
            "flex justify-center gap-8 mt-4 p-4 bg-[#c0c0c0] border border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#404040] border-b-[#404040]",
          ),
        ],
        [
          div([class("text-center")], [
            span([class("text-2xl font-bold text-[#0000ff] block")], [
              text("28+"),
            ]),
            span([class("text-xs text-black font-bold")], [
              text("LIBRARIES"),
            ]),
          ]),
          div([class("text-center")], [
            span([class("text-2xl font-bold text-[#0000ff] block")], [
              text("4"),
            ]),
            span([class("text-xs text-black font-bold")], [
              text("PROD SITES"),
            ]),
          ]),
          div([class("text-center")], [
            span([class("text-2xl font-bold text-[#0000ff] block")], [
              text("100%"),
            ]),
            span([class("text-xs text-black font-bold")], [
              text("GLEAM"),
            ]),
          ]),
        ],
      ),
    ],
  )
}

pub fn about_content() -> Element(msg) {
  div(
    [
      class(
        "p-4 bg-[#ffffff] border border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#404040] border-b-[#404040] m-2 flex gap-4 items-start",
      ),
    ],
    [
      div([class("flex-1")], [
        p([class("text-black leading-relaxed text-sm")], [
          text(
            "Welcome to my digital space! I'm a passionate Gleam developer who believes in the power of functional programming and type safety. When I'm not crafting elegant Gleam libraries, you'll find me building production web applications that users actually love.",
          ),
        ]),
      ]),
    ],
  )
}

pub fn libraries_content() -> Element(msg) {
  div(
    [
      class(
        "p-4 bg-[#ffffff] border border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#404040] border-b-[#404040] m-2",
      ),
    ],
    [
      h3([class("text-lg font-bold text-[#000080] mb-3")], [
        text("28+ Open Source Libraries"),
      ]),
      p([class("text-black leading-relaxed text-sm mb-3")], [
        text(
          "From game engines to message queues, I build tools that push Gleam's boundaries:",
        ),
      ]),
      div([class("text-xs text-black mb-3 space-y-1")], [
        p([], [
          span([class("font-bold text-[#000080]")], [text("tiramisu")]),
          text(" - Type-safe 3D game engine"),
        ]),
        p([], [
          span([class("font-bold text-[#000080]")], [text("eventsourcing")]),
          text(" - Event-sourced systems"),
        ]),
        p([], [
          span([class("font-bold text-[#000080]")], [text("carotte")]),
          text(" - RabbitMQ client"),
        ]),
        p([], [
          span([class("font-bold text-[#000080]")], [text("franz")]),
          text(" - Kafka integration"),
        ]),
        p([], [
          span([class("font-bold text-[#000080]")], [text("protozoa")]),
          text(" - Protocol Buffers"),
        ]),
        p([], [
          span([class("font-bold text-[#000080]")], [text("clockwork")]),
          text(" - Cron scheduling"),
        ]),
        p([], [
          span([class("font-bold text-[#000080]")], [text("g18n")]),
          text(" - Internationalization"),
        ]),
        p([], [
          span([class("font-bold text-[#000080]")], [text("vapour")]),
          text(" - Steamworks SDK bindings"),
        ]),
      ]),
      a(
        [
          href("https://github.com/renatillas"),
          target("_blank"),
          class(
            "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-3 py-1 text-black text-xs font-bold hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white",
          ),
          node.nodrag(),
        ],
        [text("View All on Github")],
      ),
    ],
  )
}

pub fn sites_content() -> Element(msg) {
  div(
    [
      class(
        "p-4 bg-[#ffffff] border border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#404040] border-b-[#404040] m-2",
      ),
    ],
    [
      div([class("space-y-4")], [
        div([], [
          h3([class("text-lg font-bold text-[#000080] mb-2")], [
            text("La Tienda de Helen"),
          ]),
          p([class("text-black text-sm mb-2")], [
            text("E-commerce platform built with modern web technologies"),
          ]),
          a(
            [
              href("https://latiendadehelen.com"),
              target("_blank"),
              class(
                "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-3 py-1 text-black text-xs font-bold hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white",
              ),
              node.nodrag(),
            ],
            [text("Visit Site")],
          ),
        ]),
        div([], [
          h3([class("text-lg font-bold text-[#000080] mb-2")], [
            text("Keitepinxa Studio"),
          ]),
          p([class("text-black text-sm mb-2")], [
            text("Creative studio website showcasing digital artistry"),
          ]),
          a(
            [
              href("https://keitepinxa.studio"),
              target("_blank"),
              class(
                "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-3 py-1 text-black text-xs font-bold hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white",
              ),
              node.nodrag(),
            ],
            [text("Visit Site")],
          ),
        ]),
        div([], [
          h3([class("text-lg font-bold text-[#000080] mb-2")], [
            text("Santomot"),
          ]),
          p([class("text-black text-sm mb-2")], [
            text("A MTG custom cards shop"),
          ]),
          a(
            [
              href("https://santomot.com"),
              target("_blank"),
              class(
                "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-3 py-1 text-black text-xs font-bold hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white",
              ),
              node.nodrag(),
            ],
            [text("Visit Site")],
          ),
        ]),
        div([], [
          h3([class("text-lg font-bold text-[#000080] mb-2")], [
            text("Mikaela Abril"),
          ]),
          p([class("text-black text-sm mb-2")], [
            text("Portfolio for a talented video game engineer"),
          ]),
          a(
            [
              href("https://mikaelaabrildz.github.io"),
              target("_blank"),
              class(
                "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-3 py-1 text-black text-xs font-bold hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white",
              ),
              node.nodrag(),
            ],
            [text("Visit Site")],
          ),
        ]),
      ]),
    ],
  )
}

pub fn doom_content() -> Element(msg) {
  // Container that clips the scaled iframe to visible size
  // Uses CSS classes for responsive scaling when window is maximized
  div(
    [
      attribute.id("orb-container"),
      class("orb-container overflow-hidden"),
    ],
    [
      // Iframe at full resolution, scaled down via CSS
      html.iframe([
        attribute.src("https://pondering-c7c.pages.dev/"),
        class("orb-iframe"),
        attribute.attribute("allowfullscreen", "true"),
      ]),
    ],
  )
}

pub fn create_window_with_content(
  window: Window,
  on_drag: fn(Float, Float) -> msg,
  on_action: fn(WindowAction) -> msg,
  on_click: fn() -> msg,
  content: Element(msg),
) -> Element(msg) {
  WindowConfig(
    id: name_to_string(window.name),
    title: name_to_title(window.name),
    icon: name_to_icon(window.name),
    position: #(window.position.x, window.position.y),
    on_drag: on_drag,
    on_action: on_action,
    on_click: on_click,
    width: "",
    is_maximized: window.state == Maximized,
    content: content,
  )
  |> create_window()
}

pub fn name_to_string(name: WindowName) -> String {
  case name {
    Email -> "email"
    Skull -> "skull"
    Header -> "portfolio"
    About -> "about-me"
    Libraries -> "libraries"
    Sites -> "sites"
    Homer -> "homer"
    Dancing -> "dancing"
    Doom -> "doom"
  }
}

pub fn name_to_title(name: WindowName) -> String {
  case name {
    Email -> "email.gif - Paint"
    Skull -> "skull.gif - Media Player"
    Header -> "Renata Amutio - Portfolio"
    About -> "About Me - Properties"
    Libraries -> "My Libraries - Folder"
    Sites -> "My Sites - Folder"
    Homer -> "homer.gif - Media Player"
    Dancing -> "dancing.gif - Media Player"
    Doom -> "Pondering My Orb"
  }
}

pub fn name_to_icon(name: WindowName) -> String {
  case name {
    Email -> "📧"
    Skull -> "💀"
    Header -> "R"
    About -> "?"
    Libraries -> "📁"
    Sites -> "🌐"
    Homer -> "🎵"
    Dancing -> "💃"
    Doom -> "🔮"
  }
}
