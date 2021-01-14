import { Host, Component, h } from '@stencil/core';

@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  scoped: true,
})
export class MyComponent {
  render() {
    return <Host><label><slot /></label></Host>;
  }
}
