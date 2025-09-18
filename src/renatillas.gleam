import clique
import clique/background
import clique/node
import clique/transform.{type Transform}
import lustre
import lustre/attribute.{alt, class, href, rel, src, target}
import lustre/element.{text}
import lustre/element/html.{
  a, body, div, h1, h3, head, html, img, link, p, span, style, title,
}

pub fn main() -> Nil {
  let assert Ok(_) = clique.register()
  let app = lustre.simple(init, update, view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)

  Nil
}

pub type WindowPosition {
  WindowPosition(x: Float, y: Float)
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
    transform: Transform,
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
  ViewportPanned(Transform)
}

fn init(_flags) -> Model {
  Model(
    email_window: WindowPosition(x: 800.0, y: 50.0),
    skull_window: WindowPosition(x: 50.0, y: 150.0),
    header_window: WindowPosition(x: 300.0, y: 50.0),
    about_window: WindowPosition(x: 200.0, y: 300.0),
    libraries_window: WindowPosition(x: 400.0, y: 450.0),
    sites_window: WindowPosition(x: 600.0, y: 600.0),
    homer_window: WindowPosition(x: 30.0, y: 600.0),
    transform: transform.init(),
  )
}

fn update(model: Model, msg: Msg) -> Model {
  case msg {
    EmailWindowDragged(x, y) -> {
      Model(..model, email_window: WindowPosition(x: x, y: y))
    }
    SkullWindowDragged(x, y) -> {
      Model(..model, skull_window: WindowPosition(x: x, y: y))
    }
    HeaderWindowDragged(x, y) -> {
      Model(..model, header_window: WindowPosition(x: x, y: y))
    }
    AboutWindowDragged(x, y) -> {
      Model(..model, about_window: WindowPosition(x: x, y: y))
    }
    LibrariesWindowDragged(x, y) -> {
      Model(..model, libraries_window: WindowPosition(x: x, y: y))
    }
    SitesWindowDragged(x, y) -> {
      Model(..model, sites_window: WindowPosition(x: x, y: y))
    }
    HomerWindowDragged(x, y) -> {
      Model(..model, homer_window: WindowPosition(x: x, y: y))
    }
    ViewportPanned(transform) -> {
      Model(..model, transform: transform)
    }
  }
}

fn create_email_window(position: WindowPosition) -> element.Element(Msg) {
  clique.node(
    "email-window",
    [
      node.position(position.x, position.y),
      node.on_drag(fn(_, x, y, _, _) { EmailWindowDragged(x, y) }),
      class("cursor-move select-none"),
    ],
    [
      div(
        [
          class(
            "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080]",
          ),
        ],
        [
          div(
            [
              class(
                "bg-gradient-to-r from-[#0000ff] to-[#000080] text-white px-2 py-1 flex items-center justify-between",
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
                  [text("📧")],
                ),
                span([class("font-bold text-xs")], [text("email.gif - Paint")]),
              ]),
              div([class("flex gap-1")], [
                div(
                  [
                    class(
                      "w-4 h-3 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs flex items-center justify-center text-black font-bold",
                    ),
                  ],
                  [text("×")],
                ),
              ]),
            ],
          ),
          div(
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
        ],
      ),
    ],
  )
}

fn create_homer_window(position: WindowPosition) -> element.Element(Msg) {
  clique.node(
    "homer-window",
    [
      node.position(position.x, position.y),
      node.on_drag(fn(_, x, y, _, _) { HomerWindowDragged(x, y) }),
      class("cursor-move select-none"),
    ],
    [
      div(
        [
          class(
            "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080]",
          ),
        ],
        [
          div(
            [
              class(
                "bg-gradient-to-r from-[#0000ff] to-[#000080] text-white px-2 py-1 flex items-center justify-between",
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
                  [text("🎵")],
                ),
                span([class("font-bold text-xs")], [
                  text("homer.gif - Media Player"),
                ]),
              ]),
              div([class("flex gap-1")], [
                div(
                  [
                    class(
                      "w-4 h-3 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs flex items-center justify-center text-black font-bold",
                    ),
                  ],
                  [text("×")],
                ),
              ]),
            ],
          ),
          div(
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
        ],
      ),
    ],
  )
}

fn create_skull_window(position: WindowPosition) -> element.Element(Msg) {
  clique.node(
    "skull-window",
    [
      node.position(position.x, position.y),
      node.on_drag(fn(_, x, y, _, _) { SkullWindowDragged(x, y) }),
      class("cursor-move select-none"),
    ],
    [
      div(
        [
          class(
            "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080]",
          ),
        ],
        [
          div(
            [
              class(
                "bg-gradient-to-r from-[#0000ff] to-[#000080] text-white px-2 py-1 flex items-center justify-between",
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
                  [text("💀")],
                ),
                span([class("font-bold text-xs")], [
                  text("skull.gif - Media Player"),
                ]),
              ]),
              div([class("flex gap-1")], [
                div(
                  [
                    class(
                      "w-4 h-3 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs flex items-center justify-center text-black font-bold",
                    ),
                  ],
                  [text("×")],
                ),
              ]),
            ],
          ),
          div(
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
        ],
      ),
    ],
  )
}

fn create_header_window(position: WindowPosition) -> element.Element(Msg) {
  clique.node(
    "header-window",
    [
      node.position(position.x, position.y),
      node.on_drag(fn(_, x, y, _, _) { HeaderWindowDragged(x, y) }),
      class("cursor-move select-none"),
    ],
    [
      div(
        [
          class(
            "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] w-96",
          ),
        ],
        [
          div(
            [
              class(
                "bg-gradient-to-r from-[#0000ff] to-[#000080] text-white px-2 py-1 flex items-center justify-between",
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
                  [text("R")],
                ),
                span([class("font-bold text-sm")], [
                  text("Renata Amutio - Portfolio"),
                ]),
              ]),
              div([class("flex gap-1")], [
                div(
                  [
                    class(
                      "w-5 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs flex items-center justify-center text-black font-bold",
                    ),
                  ],
                  [text("_")],
                ),
                div(
                  [
                    class(
                      "w-5 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs flex items-center justify-center text-black font-bold",
                    ),
                  ],
                  [text("□")],
                ),
                div(
                  [
                    class(
                      "w-5 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs flex items-center justify-center text-black font-bold",
                    ),
                  ],
                  [text("×")],
                ),
              ]),
            ],
          ),
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
        ],
      ),
    ],
  )
}

fn create_about_window(position: WindowPosition) -> element.Element(Msg) {
  clique.node(
    "about-window",
    [
      node.position(position.x, position.y),
      node.on_drag(fn(_, x, y, _, _) { AboutWindowDragged(x, y) }),
      class("cursor-move select-none"),
    ],
    [
      div(
        [
          class(
            "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080]",
          ),
        ],
        [
          div(
            [
              class(
                "bg-gradient-to-r from-[#0000ff] to-[#000080] text-white px-2 py-1 flex items-center justify-between",
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
                  [text("?")],
                ),
                span([class("font-bold text-sm")], [
                  text("About Me - Properties"),
                ]),
              ]),
              div([class("flex gap-1")], [
                div(
                  [
                    class(
                      "w-5 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs flex items-center justify-center text-black font-bold",
                    ),
                  ],
                  [text("×")],
                ),
              ]),
            ],
          ),
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
          ),
        ],
      ),
    ],
  )
}

fn create_libraries_window(position: WindowPosition) -> element.Element(Msg) {
  clique.node(
    "libraries-window",
    [
      node.position(position.x, position.y),
      node.on_drag(fn(_, x, y, _, _) { LibrariesWindowDragged(x, y) }),
      class("cursor-move select-none"),
    ],
    [
      div(
        [
          class(
            "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080]",
          ),
        ],
        [
          div(
            [
              class(
                "bg-gradient-to-r from-[#0000ff] to-[#000080] text-white px-2 py-1 flex items-center justify-between",
              ),
            ],
            [
              div([class("flex items-center gap-2")], [
                div(
                  [
                    class(
                      "w-4 h-4 bg-[#ffff00] border border-[#808080] flex items-center justify-center text-xs text-black font-bold",
                    ),
                  ],
                  [text("📁")],
                ),
                span([class("font-bold text-sm")], [
                  text("My Libraries - Folder"),
                ]),
              ]),
              div([class("flex gap-1")], [
                div(
                  [
                    class(
                      "w-5 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs flex items-center justify-center text-black font-bold",
                    ),
                  ],
                  [text("×")],
                ),
              ]),
            ],
          ),
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
              div(
                [
                  class(
                    "bg-[#c0c0c0] border border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#404040] border-b-[#404040] px-3 py-2 inline-block",
                  ),
                ],
                [
                  span([class("text-xs text-black font-bold")], [
                    text("📄 gleam_libraries.txt"),
                  ]),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  )
}

fn create_sites_window(position: WindowPosition) -> element.Element(Msg) {
  clique.node(
    "sites-window",
    [
      node.position(position.x, position.y),
      node.on_drag(fn(_, x, y, _, _) { SitesWindowDragged(x, y) }),
      class("cursor-move select-none"),
    ],
    [
      div(
        [
          class(
            "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] w-96",
          ),
        ],
        [
          div(
            [
              class(
                "bg-gradient-to-r from-[#0000ff] to-[#000080] text-white px-2 py-1 flex items-center justify-between",
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
                  [text("🌐")],
                ),
                span([class("font-bold text-sm")], [text("Production Sites")]),
              ]),
              div([class("flex gap-1")], [
                div(
                  [
                    class(
                      "w-5 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs flex items-center justify-center text-black font-bold",
                    ),
                  ],
                  [text("×")],
                ),
              ]),
            ],
          ),
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
                    text(
                      "E-commerce platform built with modern web technologies",
                    ),
                  ]),
                  a(
                    [
                      href("https://latiendadehelen.com"),
                      target("_blank"),
                      class(
                        "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-3 py-1 text-black text-xs font-bold hover:bg-[#d0d0d0]",
                      ),
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
                        "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-3 py-1 text-black text-xs font-bold hover:bg-[#d0d0d0]",
                      ),
                    ],
                    [text("Visit Site")],
                  ),
                ]),
              ]),
            ],
          ),
        ],
      ),
    ],
  )
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
      style(
        [],
        "
        .pixelated {
          image-rendering: -moz-crisp-edges;
          image-rendering: -webkit-crisp-edges; 
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }
        .blink {
          animation: blink 1s linear infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      ",
      ),
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
            class("w-full h-full absolute inset-0"),
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
            clique.nodes([
              #("email-window", create_email_window(model.email_window)),
              #("homer-window", create_homer_window(model.homer_window)),
              #("skull-window", create_skull_window(model.skull_window)),
              #("header-window", create_header_window(model.header_window)),
              #("about-window", create_about_window(model.about_window)),
              #(
                "libraries-window",
                create_libraries_window(model.libraries_window),
              ),
              #("sites-window", create_sites_window(model.sites_window)),
            ]),
          ],
        ),
        // Simple footer taskbar - remove all the static content above this
        div(
          [
            class(
              "fixed bottom-0 left-0 right-0 bg-[#c0c0c0] border-t-2 border-t-white p-2 flex items-center justify-between z-50",
            ),
          ],
          [
            div([class("flex items-center gap-2")], [
              div(
                [
                  class(
                    "bg-[#008000] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] px-3 py-1 flex items-center gap-2 text-white font-bold text-sm",
                  ),
                ],
                [span([class("text-lg")], [text("🟢")]), text("Start")],
              ),
            ]),
            div([class("flex-1 text-center")], [
              p([class("text-black text-xs font-bold")], [
                text(
                  "BUILT WITH ♥ IN GLEAM • WINDOWS Y2K STYLE • FUNCTIONAL IS BEAUTIFUL",
                ),
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
