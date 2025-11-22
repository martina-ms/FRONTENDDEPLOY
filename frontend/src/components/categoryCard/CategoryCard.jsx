import React from "react";
import "./CategoryCard.css";

import PropTypes from "prop-types";

const CategoryCard = ({ name, img, onClick }) => {
  return (
    <div className="category-card" onClick={onClick}>
      <img src={img} alt={name} />
      <p>{name}</p>
    </div>
  );
};


CategoryCard.propTypes = {
  name: PropTypes.string.isRequired,
  img: PropTypes.string.isRequired,
  onClick: PropTypes.string.isRequired,
};

export default CategoryCard;