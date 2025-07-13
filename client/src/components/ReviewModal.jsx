import React, { useState } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';

const ReviewModal = ({ isOpen, onClose, onSubmit, productName, loading = false }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    const newErrors = {};
    if (!comment.trim()) {
      newErrors.comment = 'Review comment is required';
    } else if (comment.trim().length < 10) {
      newErrors.comment = 'Review comment must be at least 10 characters';
    } else if (comment.trim().length > 500) {
      newErrors.comment = 'Review comment must be less than 500 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({ rating, comment: comment.trim() });
  };

  const handleClose = () => {
    setRating(5);
    setComment('');
    setErrors({});
    onClose();
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`cursor-pointer text-2xl ${
            i <= rating ? 'text-yellow-400' : 'text-gray-300'
          } hover:text-yellow-400 transition-colors`}
          onClick={() => setRating(i)}
        />
      );
    }
    return stars;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Write a Review</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Reviewing: {productName}</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating *
            </label>
            <div className="flex items-center space-x-1">
              {renderStars()}
              <span className="ml-2 text-sm text-gray-600">
                {rating} out of 5 stars
              </span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review *
            </label>
            <textarea
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (errors.comment) {
                  setErrors(prev => ({ ...prev, comment: '' }));
                }
              }}
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.comment ? 'border-red-500' : 'border-gray-300'
              }`}
              rows="4"
              placeholder="Share your experience with this product..."
              maxLength="500"
            />
            {errors.comment && (
              <p className="text-red-500 text-sm mt-1">{errors.comment}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal; 