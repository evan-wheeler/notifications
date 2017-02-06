import React from 'react';
import { connect } from 'react-redux';
import { notifyDismiss, notifyPause, notifyResume, NAME } from './ducks';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

const Notif = ({ msg, onDismiss, onPause, onResume }) => {
    const { duration,
        id,
        dismissable, 
        title,
        iconCls,
        percent,
        tickDuration,
        message,
        count,
        type } = msg;

    return (
        <div
            className={`notification ${type} ${dismissable ? 'notification_dismissable' : ''}`}
            onClick={ () => { dismissable && onDismiss(id); }}
            onMouseEnter={ () => duration !== 0 && onPause(id)}
            onMouseLeave={ () => duration !== 0 && onResume(id)}
        >
            <i className={iconCls} />
            <div className='notif__content'>
                <h3>{title} {count > 1 && <small className='notification__counter'>[{count}]</small>}</h3>
                <span>{message}</span>
            </div>
            {tickDuration && <div className='notif__timebar' >
                <div style={{
                    transition: `width ${tickDuration}ms linear`,
                    width: `${percent}%`
                }} />
            </div>
            }
            {
                dismissable &&
                <button tabIndex='0' onClick={
                    e => {
                        e.preventDefault();
                        onDismiss(id);
                    }
                }
                    className='notification__dismiss_btn'><i className='fa fa-times-circle' /></button>
            }
        </div>
    );
};

function renderItems(items, onDismiss, onPause, onResume) {
    const notifProps = { onDismiss, onPause, onResume };
    return (
        <ReactCSSTransitionGroup
            transitionName="notification"
            transitionEnterTimeout={300}
            transitionLeaveTimeout={300}>{
                items.map(msg => <Notif key={msg.id} msg={msg} {...notifProps} />)
            }</ReactCSSTransitionGroup>
    );
}

// Notifications component

export const Notifications = ({notifications, onDismiss, notifyPause, notifyResume}) =>
    <div className='notifications'>{
        renderItems(notifications, onDismiss, notifyPause, notifyResume)
    }</div>;

// Export connected component as default.

export default connect(
    state => ({ notifications: state[NAME] }),
    {
        onDismiss: notifyDismiss,
        notifyPause: notifyPause,
        notifyResume: notifyResume
    }
)(Notifications);
