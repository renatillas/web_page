import clique
import clique/background
import clique/node
import clique/transform.{type Transform}
import gleam/int
import lustre
import lustre/attribute.{alt, class, href, rel, src, target}
import lustre/element.{text}
import lustre/element/html.{
  a, body, div, h1, h3, head, html, img, link, p, span, style, title,
}
import renatillas/touch
import renatillas/window

pub fn main() -> Nil {
  let assert Ok(_) = clique.register()
  touch.initialize_touch_support()
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
    dancing_window: WindowPosition,
    transform: Transform,
    z_index_counter: Int,
    window_z_indexes: #(Int, Int, Int, Int, Int, Int, Int, Int),
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
  }
}

fn create_email_window(
  position: WindowPosition,
  z_index: Int,
) -> element.Element(Msg) {
  window.create_window(window.WindowConfig(
    id: "email-window",
    title: "email.gif - Paint",
    icon: "📧",
    position: #(position.x, position.y),
    z_index: z_index,
    on_drag: EmailWindowDragged,
    width: "",
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

fn create_dancing_window(
  position: WindowPosition,
  z_index: Int,
) -> element.Element(Msg) {
  window.create_window(window.WindowConfig(
    id: "dancing-window",
    title: "dancing.gif - Media Player",
    icon: "💃",
    position: #(position.x, position.y),
    z_index: z_index,
    on_drag: DancingWindowDragged,
    width: "",
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

fn create_homer_window(
  position: WindowPosition,
  z_index: Int,
) -> element.Element(Msg) {
  clique.node(
    "homer-window",
    [
      node.position(position.x, position.y),
      node.on_drag(fn(_, x, y, _, _) { HomerWindowDragged(x, y) }),
      class("cursor-move select-none touch-draggable"),
      attribute.style("z-index", int.to_string(z_index)),
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

fn create_skull_window(
  position: WindowPosition,
  z_index: Int,
) -> element.Element(Msg) {
  clique.node(
    "skull-window",
    [
      node.position(position.x, position.y),
      node.on_drag(fn(_, x, y, _, _) { SkullWindowDragged(x, y) }),
      class("cursor-move select-none touch-draggable"),
      attribute.style("z-index", int.to_string(z_index)),
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

fn create_header_window(
  position: WindowPosition,
  z_index: Int,
) -> element.Element(Msg) {
  clique.node(
    "header-window",
    [
      node.position(position.x, position.y),
      node.on_drag(fn(_, x, y, _, _) { HeaderWindowDragged(x, y) }),
      class("cursor-move select-none touch-draggable"),
      attribute.style("z-index", int.to_string(z_index)),
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

fn create_about_window(
  position: WindowPosition,
  z_index: Int,
) -> element.Element(Msg) {
  clique.node(
    "about-window",
    [
      node.position(position.x, position.y),
      node.on_drag(fn(_, x, y, _, _) { AboutWindowDragged(x, y) }),
      class("cursor-move select-none touch-draggable"),
      attribute.style("z-index", int.to_string(z_index)),
    ],
    [
      div(
        [
          class(
            "max-w-md bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080]",
          ),
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

fn create_libraries_window(
  position: WindowPosition,
  z_index: Int,
) -> element.Element(Msg) {
  clique.node(
    "libraries-window",
    [
      node.position(position.x, position.y),
      node.on_drag(fn(_, x, y, _, _) { LibrariesWindowDragged(x, y) }),
      class("cursor-move select-none touch-draggable"),
      attribute.style("z-index", int.to_string(z_index)),
    ],
    [
      div(
        [
          class(
            "max-w-md bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080]",
          ),
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
          ),
        ],
      ),
    ],
  )
}

fn create_sites_window(
  position: WindowPosition,
  z_index: Int,
) -> element.Element(Msg) {
  clique.node(
    "sites-window",
    [
      node.position(position.x, position.y),
      node.on_drag(fn(_, x, y, _, _) { SitesWindowDragged(x, y) }),
      class("cursor-move select-none touch-draggable"),
      attribute.style("z-index", int.to_string(z_index)),
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
        /* Enhanced touch support for mobile dragging */
        .touch-draggable {
          touch-action: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        }
        .drag-handle {
          cursor: move;
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
          user-drag: none;
        }
        /* Prevent text selection on mobile */
        .touch-draggable, .touch-draggable * {
          -webkit-tap-highlight-color: transparent;
        }
        /* Prevent dragging on buttons and links */
        .no-drag, button, a, [data-window-button] {
          pointer-events: auto !important;
          position: relative;
          z-index: 9999;
        }
        /* Ensure drag handles don't override button clicks */
        .drag-handle button,
        .drag-handle a,
        .drag-handle [data-window-button] {
          pointer-events: auto !important;
          z-index: 10000;
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
            clique.nodes([
              #(
                "email-window",
                create_email_window(
                  model.email_window,
                  model.window_z_indexes.0,
                ),
              ),
              #(
                "skull-window",
                create_skull_window(
                  model.skull_window,
                  model.window_z_indexes.1,
                ),
              ),
              #(
                "header-window",
                create_header_window(
                  model.header_window,
                  model.window_z_indexes.2,
                ),
              ),
              #(
                "about-window",
                create_about_window(
                  model.about_window,
                  model.window_z_indexes.3,
                ),
              ),
              #(
                "libraries-window",
                create_libraries_window(
                  model.libraries_window,
                  model.window_z_indexes.4,
                ),
              ),
              #(
                "sites-window",
                create_sites_window(
                  model.sites_window,
                  model.window_z_indexes.5,
                ),
              ),
              #(
                "homer-window",
                create_homer_window(
                  model.homer_window,
                  model.window_z_indexes.6,
                ),
              ),
              #(
                "dancing-window",
                create_dancing_window(
                  model.dancing_window,
                  model.window_z_indexes.7,
                ),
              ),
            ]),
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
