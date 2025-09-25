import React from 'react';

interface StarRatingProps {
    rating: number;
}

export const StarRating = ({ rating }: StarRatingProps) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
    return (
      <div className="flex items-center text-yellow-400" aria-label={`評分為 ${rating} 顆星（滿分5顆星）`}>
        {[...Array(fullStars)].map((_, i) => <i key={`full-${i}`} className="fas fa-star" aria-hidden="true"></i>)}
        {halfStar && <i className="fas fa-star-half-alt" aria-hidden="true"></i>}
        {[...Array(emptyStars)].map((_, i) => <i key={`empty-${i}`} className="far fa-star" aria-hidden="true"></i>)}
      </div>
    );
};
