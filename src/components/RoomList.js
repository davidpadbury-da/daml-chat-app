import React from 'react';
import Proptypes from 'prop-types';

const RoomList = props => {
  const { rooms, currentRoom, switchToRoom, currentUser } = props;
  const roomList = rooms.map(room => {
    const roomIcon = '🌐';
    const isRoomActive = currentRoom && room.id === currentRoom.id ? 'active' : '';

    return (
      <li
        className={isRoomActive}
        key={room.id}
        onClick={() => switchToRoom(room.id)}
      >
        <span className="room-icon">{roomIcon}</span>
        <span className="room-name">{room.channelName}</span>
      </li>
    );
  });
  return (
    <div className="rooms">
      <ul className="chat-rooms">{roomList}</ul>
    </div>
  );
};

RoomList.propTypes = {
  rooms: Proptypes.array.isRequired,
  currentRoom: Proptypes.object,
  switchToRoom: Proptypes.func.isRequired,
  currentUser: Proptypes.string.isRequired,
};

export default RoomList;