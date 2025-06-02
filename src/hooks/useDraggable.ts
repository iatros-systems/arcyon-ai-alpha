import { useEffect } from "react";

/**
 * Permite arrastrar cualquier elemento por id en la pantalla.
 * @param widgetId id del elemento a volver draggable
 */
export function useDraggable(widgetId: string) {
  useEffect(() => {
    const widget = document.getElementById(widgetId);
    if (!widget) return;

    widget.style.position = "fixed";
    widget.style.cursor = "move";

    let offsetX = 0, offsetY = 0, startX = 0, startY = 0, dragging = false;

    const onMouseDown = (e: MouseEvent) => {
      dragging = true;
      startX = e.clientX - widget.offsetLeft;
      startY = e.clientY - widget.offsetTop;
      document.body.style.userSelect = "none";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      offsetX = e.clientX - startX;
      offsetY = e.clientY - startY;
      widget.style.left = offsetX + "px";
      widget.style.top = offsetY + "px";
    };

    const onMouseUp = () => {
      dragging = false;
      document.body.style.userSelect = "";
    };

    widget.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      widget.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [widgetId]);
}
