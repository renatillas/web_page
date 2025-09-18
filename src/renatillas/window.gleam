import clique
import clique/node
import gleam/int
import lustre/attribute.{class, style}
import lustre/element.{type Element}
import lustre/element/html.{button, div, span, text}

pub type WindowConfig(msg) {
  WindowConfig(
    id: String,
    title: String,
    icon: String,
    position: #(Float, Float),
    z_index: Int,
    on_drag: fn(Float, Float) -> msg,
    content: Element(msg),
    width: String,
  )
}

pub fn create_window(config: WindowConfig(msg)) -> Element(msg) {
  clique.node(
    config.id,
    [
      node.position(config.position.0, config.position.1),
      node.on_drag(fn(_, x, y, _, _) { config.on_drag(x, y) }),
      class("cursor-move select-none touch-draggable"),
      style("z-index", int.to_string(config.z_index)),
    ],
    [
      div(
        [
          class(
            "bg-[#c0c0c0] border-2 border-t-white max-w-sm border-l-white border-r-[#808080] border-b-[#808080] "
            <> config.width,
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
              create_window_controls(),
            ],
          ),
          config.content,
        ],
      ),
    ],
  )
}

fn create_window_controls() -> Element(msg) {
  div([class("flex gap-1")], [
    button(
      [
        class(
          "w-5 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs flex items-center justify-center text-black font-bold hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white cursor-pointer",
        ),
        node.nodrag(),
      ],
      [text("_")],
    ),
    button(
      [
        class(
          "w-5 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs flex items-center justify-center text-black font-bold hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white cursor-pointer",
        ),
        node.nodrag(),
      ],
      [text("□")],
    ),
    button(
      [
        class(
          "w-5 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs flex items-center justify-center text-black font-bold hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white cursor-pointer",
        ),
        node.nodrag(),
      ],
      [text("×")],
    ),
  ])
}
