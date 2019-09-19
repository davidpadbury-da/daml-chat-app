import React from 'react';
import Proptypes from 'prop-types';
import Select from 'react-select'

const Dialog = props => {
  const { userId, secret, handleInput, login, parties, updateUserId } = props;

  const options = parties.filter(p => p.isLocal).map(({ partyId: value, displayName: label }) => ({ value, label }))
  const selectedOption = options.find(({value}) => value === userId )
  const onUserSelected = ({value}) => updateUserId(value)

  console.log('selected user', userId)
  return (
    <div className="dialog-container">
      <div className="dialog">
        <form className="dialog-form" onSubmit={login}>
          <label className="username-label" htmlFor="username">
            Party
          </label>
          <Select className="username-input" id="username" name="userId" placeholder="Username" options={options} value={selectedOption} onChange={onUserSelected} />
          <label className="username-label" htmlFor="username">
            Password
          </label>
          <input
            id="secret"
            className="username-input"
            autoFocus
            type="password"
            name="secret"
            value={secret}
            onChange={handleInput}
            placeholder="Tell us your secrets (password)"
          />
          <button type="submit" className="submit-btn">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

Dialog.propTypes = {
  userId: Proptypes.string.isRequired,
  handleInput: Proptypes.func.isRequired,
  login: Proptypes.func.isRequired,
  parties: Proptypes.array.isRequired,
  updateUserId: Proptypes.func.isRequired,
  secret: Proptypes.string.isRequired
};

export default Dialog;