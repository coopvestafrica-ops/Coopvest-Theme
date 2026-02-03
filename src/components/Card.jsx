import React from 'react';

const Card = ({ children, className = '', title, style = {} }) => {
  return (
    <div className={`card ${className}`} style={style}>
      {title && <div className="card-header"><h3>{title}</h3></div>}
      <div className="card-body">{children}</div>
    </div>
  );
};

export default Card;
