import React from 'react';
import Proptypes from 'prop-types';

const RoomUsers = props => {
  const { roomUsers, currentUser } = props;
  const users = roomUsers.map(user => {
    return (
      <li className="room-member" key={user}>
        <div>
          <span className={`presence online`} />
          <span>{user}</span>
        </div>
      </li>
    );
  });

  return (
    <div className="room-users">
      <ul>{users}</ul>
    </div>
  );
};

RoomUsers.propTypes = {
  roomUsers: Proptypes.array.isRequired,
  currentUser: Proptypes.string.isRequired,
};

export default RoomUsers;