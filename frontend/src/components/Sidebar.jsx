import React, { useState } from 'react';
import './Sidebar.css';
import SidebarHeader from './SidebarHeader';
import SidebarChatlist from './SidebarChatlist';
import SidebarStatus from './SidebarStatus';
import SidebarGroupChatlist from './SidebarGroupChatList';
import PropTypes from 'prop-types';

const Sidebar = ({ onSelectContact }) => {
  const [activeView, setActiveView] = useState('chats');

  const renderBody = () => {
    switch (activeView) {
      case 'chats':
        return <SidebarChatlist onSelectContact={onSelectContact} />;
      case 'status':
        return <SidebarStatus />;
      case 'groups':
        return <SidebarGroupChatlist />;
      default:
        return null;
    }
  };

  return (
    <div className="col-md-3 sidebar p-0">
      <SidebarHeader active={activeView} onChange={setActiveView} />
      <div className="sidebar-body">{renderBody()}</div>
    </div>
  );
};

Sidebar.propTypes = {
  onSelectContact: PropTypes.func.isRequired,
};

export default Sidebar;