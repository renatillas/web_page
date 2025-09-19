import clique
import clique/node
import gleam/int
import lustre/attribute.{alt, class, href, src, style, target}
import lustre/element.{type Element}
import lustre/element/html.{a, button, div, h1, h3, img, p, span, text}
import lustre/event

pub type WindowAction {
  Minimize
  Maximize
  Close
}

pub type WindowConfig(msg) {
  WindowConfig(
    id: String,
    title: String,
    icon: String,
    position: #(Float, Float),
    z_index: Int,
    on_drag: fn(Float, Float) -> msg,
    on_action: fn(WindowAction) -> msg,
    content: Element(msg),
    width: String,
    is_maximized: Bool,
  )
}

pub fn create_window(config: WindowConfig(msg)) -> Element(msg) {
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
      style("z-index", int.to_string(config.z_index)),
    ],
    [
      div(
        [
          class(case config.is_maximized {
            True ->
              "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] w-screen h-screen max-w-none "
              <> config.width
            False ->
              "bg-[#c0c0c0] border-2 border-t-white max-w-sm border-l-white border-r-[#808080] border-b-[#808080] "
              <> config.width
          }),
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
                    class(case config.icon {
                      "📁" ->
                        "w-4 h-4 bg-[#ffff00] border border-[#808080] flex items-center justify-center text-xs text-black font-bold"
                      _ ->
                        "w-4 h-4 bg-[#c0c0c0] border border-[#808080] flex items-center justify-center text-xs text-black font-bold"
                    }),
                  ],
                  [text(config.icon)],
                ),
                span([class("font-bold text-sm")], [text(config.title)]),
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
          "w-5 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs flex items-center justify-center text-black font-bold hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white ",
        ),
        node.nodrag(),
        event.on_click(on_action(Minimize)),
      ],
      [text("_")],
    ),
    button(
      [
        class(
          "w-5 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs flex items-center justify-center text-black font-bold hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white ",
        ),
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
          "w-5 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs flex items-center justify-center text-black font-bold hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white ",
        ),
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

pub fn email_window(
  position: WindowPosition,
  z_index: Int,
  on_drag: fn(Float, Float) -> msg,
  on_action: fn(WindowAction) -> msg,
  is_maximized: Bool,
) -> Element(msg) {
  create_window(WindowConfig(
    id: "email-window",
    title: "email.gif - Paint",
    icon: "📧",
    position: #(position.x, position.y),
    z_index: z_index,
    on_drag: on_drag,
    on_action: on_action,
    width: "",
    is_maximized: is_maximized,
    content: div(
      [
        class(
          "p-2 bg-[#ffffff] border border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#404040] border-b-[#404040] m-1",
        ),
      ],
      [
        img([
          src("/priv/static/email.gif"),
          alt("Email animation"),
          class("w-24 h-24 pixelated"),
        ]),
      ],
    ),
  ))
}

pub fn dancing_window(
  position: WindowPosition,
  z_index: Int,
  on_drag: fn(Float, Float) -> msg,
  on_action: fn(WindowAction) -> msg,
  is_maximized: Bool,
) -> Element(msg) {
  create_window(WindowConfig(
    id: "dancing-window",
    title: "dancing.gif - Media Player",
    icon: "💃",
    position: #(position.x, position.y),
    z_index: z_index,
    on_drag: on_drag,
    on_action: on_action,
    width: "",
    is_maximized: is_maximized,
    content: div(
      [
        class(
          "p-2 bg-[#000000] border border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#404040] border-b-[#404040] m-1",
        ),
      ],
      [
        img([
          src("/priv/static/dancing.gif"),
          alt("Dancing animation"),
          class("w-24 h-24 pixelated"),
        ]),
      ],
    ),
  ))
}

pub fn homer_window(
  position: WindowPosition,
  z_index: Int,
  on_drag: fn(Float, Float) -> msg,
  on_action: fn(WindowAction) -> msg,
  is_maximized: Bool,
) -> Element(msg) {
  WindowConfig(
    id: "homer-window",
    title: "homer.gif - Media Player",
    icon: "🎵",
    position: #(position.x, position.y),
    z_index: z_index,
    on_drag: on_drag,
    on_action: on_action,
    width: "",
    is_maximized: is_maximized,
    content: div(
      [
        class(
          "bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-1",
        ),
      ],
      [
        img([
          src("/priv/static/homer.gif"),
          alt("Homer Simpson"),
          class("pixelated bg-white"),
        ]),
      ],
    ),
  )
  |> create_window()
}

pub fn skull_window(
  position: WindowPosition,
  z_index: Int,
  on_drag: fn(Float, Float) -> msg,
  on_action: fn(WindowAction) -> msg,
  is_maximized: Bool,
) -> Element(msg) {
  WindowConfig(
    id: "skull-window",
    title: "skull.gif - Media Player",
    icon: "💀",
    position: #(position.x, position.y),
    z_index: z_index,
    on_drag: on_drag,
    on_action: on_action,
    width: "",
    is_maximized: is_maximized,
    content: div(
      [
        class(
          "p-2 bg-[#000000] border border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#404040] border-b-[#404040] m-1",
        ),
      ],
      [
        img([
          src("/priv/static/skull.gif"),
          alt("Skull animation"),
          class("w-20 h-20 pixelated"),
        ]),
      ],
    ),
  )
  |> create_window()
}

pub fn header_window(
  position: WindowPosition,
  z_index: Int,
  on_drag: fn(Float, Float) -> msg,
  on_action: fn(WindowAction) -> msg,
  is_maximized: Bool,
) -> Element(msg) {
  WindowConfig(
    id: "header-window",
    title: "Renata Amutio - Portfolio",
    icon: "R",
    position: #(position.x, position.y),
    z_index: z_index,
    on_drag: on_drag,
    on_action: on_action,
    width: "",
    is_maximized: is_maximized,
    content: div(
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
                text("17+"),
              ]),
              span([class("text-xs text-black font-bold")], [
                text("LIBRARIES"),
              ]),
            ]),
            div([class("text-center")], [
              span([class("text-2xl font-bold text-[#0000ff] block")], [
                text("2"),
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
    ),
  )
  |> create_window()
}

pub fn about_window(
  position: WindowPosition,
  z_index: Int,
  on_drag: fn(Float, Float) -> msg,
  on_action: fn(WindowAction) -> msg,
  is_maximized: Bool,
) -> Element(msg) {
  WindowConfig(
    id: "about-window",
    title: "About Me - Properties",
    icon: "?",
    position: #(position.x, position.y),
    z_index: z_index,
    on_drag: on_drag,
    on_action: on_action,
    width: "",
    is_maximized: is_maximized,
    content: div(
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
    ),
  )
  |> create_window()
}

fn libraries_content() -> Element(msg) {
  div(
    [
      class(
        "p-4 bg-[#ffffff] border border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#404040] border-b-[#404040] m-2",
      ),
    ],
    [
      h3([class("text-lg font-bold text-[#000080] mb-3")], [
        text("17+ Open Source Libraries"),
      ]),
      p([class("text-black leading-relaxed text-sm mb-4")], [
        text(
          "Crafted with precision using Gleam's powerful type system. Each library solves real problems while maintaining elegant APIs and comprehensive documentation.",
        ),
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
        [text("Github")],
      ),
    ],
  )
}

pub fn libraries_window(
  position: WindowPosition,
  z_index: Int,
  on_drag: fn(Float, Float) -> msg,
  on_action: fn(WindowAction) -> msg,
  is_maximized: Bool,
) -> Element(msg) {
  WindowConfig(
    id: "libraries-window",
    title: "My Libraries - Folder",
    icon: "📁",
    position: #(position.x, position.y),
    z_index: z_index,
    on_drag: on_drag,
    on_action: on_action,
    width: "",
    is_maximized: is_maximized,
    content: libraries_content(),
  )
  |> create_window()
}

fn sites_content() -> Element(msg) {
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
      ]),
    ],
  )
}

pub fn sites_window(
  position: WindowPosition,
  z_index: Int,
  on_drag: fn(Float, Float) -> msg,
  on_action: fn(WindowAction) -> msg,
  is_maximized: Bool,
) -> Element(msg) {
  WindowConfig(
    id: "sites-window",
    title: "Production Sites - Folder",
    icon: "🌐",
    position: #(position.x, position.y),
    z_index: z_index,
    on_drag: on_drag,
    on_action: on_action,
    width: "",
    is_maximized: is_maximized,
    content: sites_content(),
  )
  |> create_window()
}
