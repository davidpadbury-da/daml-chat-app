// client/src/components/ChatSession.js

import React from 'react';
import Proptypes from 'prop-types';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown'
import CodeBlock from './CodeBlock'

const ChatSession = props => {
  const { messages, parties } = props;

  return messages.map(message => {
    const time = format(new Date(`${message.timestamp}`), 'HH:mm');

    return (
      <li className="message" key={message.timestamp.getTime()}>
        <div>
          <span className="user-id">{parties[message.sender] || message.sender}</span>
          <span>
            <ReactMarkdown
              source={message.text}
              renderers={{ code: CodeBlock }}
              />
          </span>
        </div>
        <span className="message-time">{time}</span>
      </li>
    );
  });
};

ChatSession.propTypes = {
  messages: Proptypes.arrayOf(Proptypes.object).isRequired,
  parties: Proptypes.arrayOf(Proptypes.object).isRequired,
};

export default ChatSession;