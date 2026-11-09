/**
 * OmniMarket AI - useRAGPost Custom Hook
 * Manages structured product inputs, image upload, AI post generation, and Facebook publishing.
 */

import { useState } from 'react';
import { aiService } from '../services/aiService';
import { facebookService } from '../services/facebookService';

export const useRAGPost = () => {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [details, setDetails] = useState('');

  // Real Product Image State
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [photocardTheme, setPhotocardTheme] = useState('teal'); // 'teal' | 'blue'

  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const clearFeedback = () => setFeedback({ type: '', message: '' });

  // Handle local file upload
  const handleFileUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Please upload a valid image file (PNG, JPG, WEBP).' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImageFile(file);
      setImagePreviewUrl(e.target.result);
      clearFeedback();
    };
    reader.readAsDataURL(file);
  };

  // Handle remote image URL
  const handleUrlChange = (url) => {
    setImageUrl(url);
    if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image'))) {
      setImagePreviewUrl(url);
    } else if (!url) {
      if (!imageFile) setImagePreviewUrl('');
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImageUrl('');
    setImagePreviewUrl('');
  };

  // Generate marketing post dynamically based on user inputs
  const generate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!productName.trim() || !category.trim()) {
      setFeedback({
        type: 'error',
        message: 'Product Name and Category are required.'
      });
      return;
    }

    setLoading(true);
    clearFeedback();

    try {
      const data = await aiService.generatePost({
        productName: productName.trim(),
        category: category.trim(),
        price: price.trim(),
        discount: discount.trim(),
        details: details.trim()
      });

      if (data.success || data.caption || data.posts) {
        const generatedPosts = data.posts || [{ caption: data.caption || data.text, platform: 'Facebook' }];
        setPosts(generatedPosts);
      } else {
        setFeedback({ type: 'error', message: data.message || 'Failed to generate post.' });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error communicating with backend server.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Publish post + Photocard to Facebook Page
  const publishToFacebook = async (captionText, targetPlatform = 'Facebook', photocardDataUrl = null) => {
    setPublishing(true);
    clearFeedback();

    try {
      const data = await facebookService.publishPost({
        caption: captionText,
        imageUrl: photocardDataUrl || imagePreviewUrl || null,
        platform: targetPlatform
      });

      if (data.success) {
        return { success: true, data };
      } else {
        setFeedback({
          type: 'error',
          message: data.message || 'Publishing failed.'
        });
        return { success: false, message: data.message };
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'An error occurred while publishing to Facebook.'
      });
      return { success: false, message: err.message };
    } finally {
      setPublishing(false);
    }
  };

  return {
    productName,
    setProductName,
    category,
    setCategory,
    price,
    setPrice,
    discount,
    setDiscount,
    details,
    setDetails,
    imageFile,
    imageUrl,
    imagePreviewUrl,
    setImagePreviewUrl,
    photocardTheme,
    setPhotocardTheme,
    handleFileUpload,
    handleUrlChange,
    clearImage,
    loading,
    publishing,
    posts,
    setPosts,
    feedback,
    clearFeedback,
    generate,
    publishToFacebook
  };
};

export default useRAGPost;
