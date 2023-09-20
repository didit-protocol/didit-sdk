import { DiditLogin } from 'didit-sdk';

const EmbeddedLoginView = () => (
  <div style={{ padding: '20px' }}>
    <h1>Embedded Login View</h1>
    <div style={{ padding: '100px', maxWidth: '400px' }}>
      <DiditLogin mode="embedded" />
    </div>
  </div>
);

export default EmbeddedLoginView;
