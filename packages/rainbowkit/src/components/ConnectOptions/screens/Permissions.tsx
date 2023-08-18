import React from 'react';

interface PermissionListProps {
  permissions: {
    id: React.Key | null | undefined;
    text: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined;
    authorized: boolean | undefined;
  }[];
  togglePermission: (id: React.Key | null | undefined) => void;
}

const PermissionListComponent: React.FC<PermissionListProps> = ({
  permissions,
  togglePermission,
}) => {
  return (
    <div className="permissions-content">
      <h2>Authorize Permissions</h2>
      <ul>
        {permissions.map((permission) => (
          <li key={permission.id}>
            <span>{permission.text}</span>
            <label className="toggle-container">
              <input
                type="checkbox"
                checked={permission.authorized}
                onChange={() => togglePermission(permission.id)}
              />
              <span className="toggle"></span>
            </label>
          </li>
        ))}
      </ul>
      <button className="popup-button">
        Continue
      </button>
    </div>
  );
};

export default PermissionListComponent;
