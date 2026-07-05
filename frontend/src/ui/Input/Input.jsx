import React, { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="form-group">
      {label && <label className="input-label">{label}</label>}
      <input
        ref={ref}
        /* Если есть ошибка, добавляем класс error-border для подсветки */
        className={`input-field ${error ? 'error-border' : ''} ${className}`}
        {...props}
      />
      {/* Рендерим текст ошибки, если он передан */}
      {error && <span className="error-message">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;