import {
  Component,
  Element,
  Event,
  Listen,
  Host,
  h,
  Prop,
  EventEmitter,
  VNode,
  Watch
} from "@stencil/core";

@Component({
  tag: "calcite-label",
  styleUrl: "calcite-label.css",
  scoped: true
})
export class CalciteLabel {
  //--------------------------------------------------------------------------
  //
  //  Element
  //
  //--------------------------------------------------------------------------

  @Element() el;

  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  /** specify the text alignment of the label */
  @Prop({ reflect: true }) alignment: string = "start";

  /** specify the status of the label and any child input / input messages */
  @Prop({ mutable: true, reflect: true }) status: string = "idle";

  /** The id of the input associated with the label */
  @Prop({ reflect: true }) for: string;

  /** specify the scale of the input, defaults to m */
  @Prop({ mutable: true, reflect: true }) scale: string = "m";

  /** specify theme of the label and its any child input / input messages */
  @Prop({ reflect: true }) theme: string;

  /** is the wrapped element positioned inline with the label slotted text */
  @Prop({ mutable: true, reflect: true }) layout: "inline" | "inline-space-between" | "default" =
    "default";

  /** eliminates any space around the label */
  @Prop() disableSpacing?: boolean;

  /** is the label disabled  */
  @Prop({ reflect: true }) disabled?: boolean;

  @Watch("disabled")
  disabledWatcher(): void {
    if (this.disabled) this.setDisabledControls();
  }
  //--------------------------------------------------------------------------
  //
  //  Events
  //
  //--------------------------------------------------------------------------

  @Event() calciteLabelFocus: EventEmitter;

  //--------------------------------------------------------------------------
  //
  //  Event Listeners
  //
  //--------------------------------------------------------------------------

  @Listen("click")
  onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    this.calciteLabelFocus.emit({
      labelEl: this.el,
      interactedEl: target,
      requestedInput: this.for
    });
    this.handleCalciteHtmlForClicks(target);
  }

  //--------------------------------------------------------------------------
  //
  //  Private Methods
  //
  //--------------------------------------------------------------------------

  private getAttributes(): Record<string, any> {
    // spread attributes from the component to rendered child, filtering out props
    const props = ["disabled", "id", "layout", "scale", "status", "theme"];
    return Array.from(this.el.attributes)
      .filter((a: any) => a && !props.includes(a.name))
      .reduce((acc: object, { name, value }) => ({ ...acc, [name]: value }), {});
  }

  private handleCalciteHtmlForClicks = (target: HTMLElement) => {
    // 1. has htmlFor
    if (!this.for) return;

    // 2. htmlFor matches a calcite component
    const inputForThisLabel = document.getElementById(this.for);
    if (!inputForThisLabel) return;
    if (!inputForThisLabel.localName.startsWith("calcite")) return;

    // 5. target is NOT the calcite component that this label matches
    if (target === inputForThisLabel) return;

    // 3. target is not a labelable native form element
    const labelableNativeElements = [
      "button",
      "input",
      "meter",
      "output",
      "progress",
      "select",
      "textarea"
    ];
    if (labelableNativeElements.includes(target.localName)) return;

    // 4. target is not a labelable calcite form element
    const labelableCalciteElements = [
      "calcite-button",
      "calcite-checkbox",
      "calcite-date",
      "calcite-inline-editable",
      "calcite-input",
      "calcite-radio",
      "calcite-radio-button",
      "calcite-radio-button-group",
      "calcite-radio-group",
      "calcite-rating",
      "calcite-select",
      "calcite-slider",
      "calcite-switch"
    ];
    if (labelableCalciteElements.includes(target.localName)) return;

    // 5. target is not a child of a labelable calcite form element
    for (let i = 0; i < labelableCalciteElements.length; i++) {
      if (target.closest(labelableCalciteElements[i])) {
        return;
      }
    }

    inputForThisLabel.click();
  };

  //--------------------------------------------------------------------------
  //
  //  Lifecycle
  //
  //--------------------------------------------------------------------------

  connectedCallback(): void {
    const status = ["invalid", "valid", "idle"];
    if (!status.includes(this.status)) this.status = "idle";

    const layout = ["inline", "inline-space-between", "default"];
    if (!layout.includes(this.layout)) this.layout = "default";

    const scale = ["s", "m", "l"];
    if (!scale.includes(this.scale)) this.scale = "m";
  }

  componentDidLoad(): void {
    if (this.disabled) this.setDisabledControls();
  }

  render(): VNode {
    const attributes = this.getAttributes();
    return (
      <Host>
        <label {...attributes} ref={(el) => (this.labelEl = el)}>
          <slot />
        </label>
      </Host>
    );
  }
  //--------------------------------------------------------------------------
  //
  //  Private State/Props
  //
  //--------------------------------------------------------------------------

  // the rendered wrapping label element
  private labelEl: HTMLLabelElement;

  //--------------------------------------------------------------------------
  //
  //  Private Methods
  //
  //--------------------------------------------------------------------------

  private setDisabledControls() {
    this.labelEl?.childNodes.forEach((item) => {
      if (item.nodeName.includes("CALCITE")) {
        (item as HTMLElement).setAttribute("disabled", "");
      }
    });
  }
}
