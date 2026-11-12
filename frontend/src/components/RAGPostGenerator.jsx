/**
 * OmniMarket AI - Generate Market Post Component
 * AI-Powered Dynamic Product Marketing Photocard Generator.
 * Integrates Gemini product analysis, dynamic template selection,
 * AI commercial background generation, Sharp composition, and direct Facebook Page publishing.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useRAGPost } from '../hooks/useRAGPost';
import { removeImageBackground } from '../utils/photocardCompositor';
import { photocardService } from '../services/photocardService';
import { postService } from '../services/postService';

const CATEGORY_SUGGESTIONS = [
  'Gaming',
  'Electronics',
  'Skincare',
  'Fashion',
  'Food',
  'Sports',
  'Home Decor'
];

const RAGPostGenerator = () => {
  const {
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
    imagePreviewUrl,
    handleFileUpload,
    handleUrlChange,
    clearImage,
    loading: postLoading,
    publishing,
    posts,
    feedback,
    clearFeedback,
    generate: generatePostText,
    publishToFacebook
  } = useRAGPost();

  const [isDragging, setIsDragging] = useState(false);
  const [activePublishIndex, setActivePublishIndex] = useState(null);
  const [cutoutDataUrl, setCutoutDataUrl] = useState(null);
  const [processingImage, setProcessingImage] = useState(false);
  
  // Photocard State
  const [photocardResult, setPhotocardResult] = useState(null);
  const [generatingPhotocard, setGeneratingPhotocard] = useState(false);
  const [regeneratingBg, setRegeneratingBg] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [showBackgroundOnly, setShowBackgroundOnly] = useState(false);

  const fileInputRef = useRef(null);

  // Process Real Product Photo into Transparent Cutout
  useEffect(() => {
    if (!imagePreviewUrl) {
      setCutoutDataUrl(null);
      return;
    }

    setProcessingImage(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const croppedCanvas = removeImageBackground(img);
        setCutoutDataUrl(croppedCanvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('Background removal fallback:', err);
        setCutoutDataUrl(imagePreviewUrl);
      } finally {
        setProcessingImage(false);
      }
    };

    img.onerror = () => {
      console.warn('Could not load image preview URL');
      setProcessingImage(false);
    };

    img.src = imagePreviewUrl;
  }, [imagePreviewUrl]);

  // Load available templates when category changes or when photocard is generated
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!category.trim()) return;
      try {
        const res = await photocardService.getTemplates(category.trim());
        const templates = res?.templates || res?.data?.templates || (Array.isArray(res?.data) ? res.data : []);
        if (templates && templates.length > 0) {
          setAvailableTemplates(templates);
        }
      } catch (err) {
        console.debug('Template list fetch notice:', err.message);
      }
    };
    fetchTemplates();
  }, [category, photocardResult?.template?.category]);

  // Combined Form Submission: Generates Post Copy + AI Photocard
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productName.trim() || !category.trim()) return;

    // 1. Generate text caption
    generatePostText(e);

    // 2. Generate AI Photocard via Sharp + OpenAI + Gemini backend pipeline
    setGeneratingPhotocard(true);
    const activeUserEmail = localStorage.getItem('userEmail') || 'moufik241-35-391@diu.edu.bd';
    try {
      const res = await photocardService.generatePhotocard({
        productName: productName.trim(),
        category: category.trim(),
        price: price.trim(),
        discount: discount.trim(),
        details: details.trim(),
        productCutout: cutoutDataUrl,
        templateId: selectedTemplateId || undefined,
        userEmail: activeUserEmail
      });

      const photocard = res?.photocard || res?.data?.photocard || res?.data;
      if (photocard && photocard.finalImageUrl) {
        setPhotocardResult(photocard);
        if (photocard.template?.templateId) {
          setSelectedTemplateId(photocard.template.templateId);
        }

        // Auto-save complete post document into MongoDB
        try {
          await postService.savePost({
            userEmail: activeUserEmail,
            productName: productName.trim(),
            productDetails: details.trim(),
            price: price.trim(),
            discount: discount.trim(),
            generatedCaption: posts[0]?.caption || photocard.analysis?.marketingHeadline || `${productName.trim()} - Special launch offer!`,
            photocardUrl: photocard.finalImageUrl
          });
        } catch (saveErr) {
          console.debug('Post record auto-save notice:', saveErr.message);
        }
      }
    } catch (err) {
      console.error('Photocard generation error:', err);
    } finally {
      setGeneratingPhotocard(false);
    }
  };

  // Switch Template Variation
  const handleTemplateChange = async (newTemplateId) => {
    setSelectedTemplateId(newTemplateId);
    setGeneratingPhotocard(true);
    try {
      const res = await photocardService.generatePhotocard({
        productName: productName.trim(),
        category: category.trim(),
        price: price.trim(),
        discount: discount.trim(),
        details: details.trim(),
        productCutout: cutoutDataUrl,
        templateId: newTemplateId
      });

      const photocard = res?.photocard || res?.data?.photocard || res?.data;
      if (photocard && photocard.finalImageUrl) {
        setPhotocardResult(photocard);
      }
    } catch (err) {
      console.error('Template variation change error:', err);
    } finally {
      setGeneratingPhotocard(false);
    }
  };

  // Regenerate AI Background Only
  const handleRegenerateBackground = async () => {
    if (!productName.trim()) return;
    setRegeneratingBg(true);
    try {
      const res = await photocardService.regenerateBackground({
        productName: productName.trim(),
        category: category.trim(),
        price: price.trim(),
        discount: discount.trim(),
        details: details.trim(),
        productCutout: cutoutDataUrl,
        templateId: selectedTemplateId || undefined
      });

      const photocard = res?.photocard || res?.data?.photocard || res?.data;
      if (photocard && photocard.finalImageUrl) {
        setPhotocardResult(photocard);
      }
    } catch (err) {
      console.error('Background regeneration error:', err);
    } finally {
      setRegeneratingBg(false);
    }
  };

  // Download Photocard
  const handleDownload = () => {
    const imageUrl = showBackgroundOnly
      ? photocardResult?.backgroundImage
      : photocardResult?.finalImageUrl;
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.download = `${productName.replace(/[^\w]/g, '_') || 'product'}_photocard.png`;
    link.href = imageUrl;
    link.click();
  };

  // Publish to Facebook (Caption + High-Res Photocard)
  const handlePublishClick = async (captionText, index) => {
    setActivePublishIndex(index);
    const photocardUrl = photocardResult?.finalImageUrl || imagePreviewUrl || null;
    const result = await publishToFacebook(captionText, 'Facebook', photocardUrl);
    if (result.success) {
      alert(`Post and Photocard successfully published to Amar bazar Page live! 🚀`);
    } else {
      alert(`Publishing failed: ${result.message}`);
    }
    setActivePublishIndex(null);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const isGenerating = postLoading || generatingPhotocard;

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-slate-100 font-sans">
      {/* 1. Header (Cleaned up: Strictly "Generate Market Post") */}
      <div className="pb-4 border-b border-gray-100 mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Generate Market Post
        </h2>
        {photocardResult?.template && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span>✨</span> {photocardResult.template.category} Studio Active
          </span>
        )}
      </div>

      {/* Error Feedback Banner */}
      {feedback.type === 'error' && feedback.message && (
        <div className="mb-5 p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between bg-rose-50 text-rose-700 border border-rose-200">
          <span>{feedback.message}</span>
          <button
            onClick={clearFeedback}
            className="text-gray-400 hover:text-gray-600 font-bold ml-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Structured Product Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Product Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name (e.g., Gaming GPU, Face Cream)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              Product Category <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              list="category-suggestions"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter product category (e.g., Gaming, Skincare, Sports)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition"
            />
            <datalist id="category-suggestions">
              {CATEGORY_SUGGESTIONS.map((cat, idx) => (
                <option key={idx} value={cat} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Row 2: Price & Discount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              Product Price <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price (e.g., 185000 BDT or 1850 BDT)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              Discount <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="Enter discount (e.g., 10% or 15000 BDT OFF)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition"
            />
          </div>
        </div>

        {/* Row 3: Product Prompt & Details */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
            PRODUCT PROMPT & DETAILS <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Write key specifications, features, or promotional instructions for Gemini & DALL-E..."
            className="w-full p-4 border border-gray-300 rounded-xl text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition"
            rows="3"
          />
        </div>

        {/* Row 4: Real Product Photo Upload */}
        <div className="pt-1">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
            Real Product Photo <span className="text-gray-400 font-normal">(Cut out & composited onto AI 3D stage)</span>
          </label>

          {!imagePreviewUrl ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/60'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
              />
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                Drag & drop your real product photo here, or <span className="text-blue-600 underline">browse file</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Background will be cleanly removed so the real product sits flush on the 3D podium.
              </p>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 max-w-md mx-auto" onClick={(e) => e.stopPropagation()}>
                <span className="text-xs text-gray-400 font-semibold">Or Image URL:</span>
                <input
                  type="url"
                  placeholder="Paste image link (https://...)"
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center gap-3">
                <img
                  src={imagePreviewUrl}
                  alt="Product preview"
                  className="w-14 h-14 object-contain rounded-xl bg-white border border-slate-200 p-1 shadow-sm"
                />
                <div>
                  <p className="text-xs font-bold text-gray-800">Real Product Photo Loaded</p>
                  <p className="text-[11px] text-emerald-600 font-semibold">
                    {processingImage ? 'Isolating product & removing background...' : '✓ Cutout ready for 3D stage compositing'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearImage}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition"
              >
                Change Photo ✕
              </button>
            </div>
          )}
        </div>

        {/* Primary Generate Button */}
        <button
          type="submit"
          disabled={isGenerating || !productName.trim() || !category.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-3"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Analyzing Product & Compositing 3D Photocard...</span>
            </>
          ) : (
            <span>Generate Post ✨</span>
          )}
        </button>
      </form>

      {/* 3. Generated Marketing Post Preview Section */}
      {posts.length > 0 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
            GENERATED MARKETING POST PREVIEW
          </h3>

          {posts.map((post, index) => (
            <div
              key={index}
              className="p-5 sm:p-6 border border-gray-200 rounded-3xl bg-gray-50/80 shadow-md space-y-5"
            >
              {/* Header Row: Target Page & Status Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-200/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span className="text-xs font-bold text-gray-700">
                    Target: {post.platform || 'Facebook'} Page
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  Ready to Publish
                </span>
              </div>

              {/* Dynamic Post Caption */}
              <div className="p-4 bg-white rounded-2xl border border-gray-200 text-gray-800 text-sm whitespace-pre-wrap leading-relaxed shadow-sm">
                {post.caption}
              </div>

              {/* 3D Commercial Studio Photocard Preview Section */}
              <div className="pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                      <span>📸</span> AI Dynamic Photocard:
                    </span>
                    {photocardResult?.template && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-blue-100/70 text-blue-800">
                        {photocardResult.template.templateName}
                      </span>
                    )}
                  </div>

                  {/* Multiple Design Variations Selector */}
                  {availableTemplates.length > 1 && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-gray-500 font-semibold">Variation:</span>
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => handleTemplateChange(e.target.value)}
                        disabled={generatingPhotocard}
                        className="px-2.5 py-1 bg-white border border-gray-300 rounded-lg font-bold text-gray-800 text-xs focus:ring-1 focus:ring-blue-500"
                      >
                        {availableTemplates.map((tmpl) => (
                          <option key={tmpl.templateId} value={tmpl.templateId}>
                            {tmpl.templateName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Selected Template & Background Style Pill */}
                {photocardResult?.template && (
                  <div className="mb-3 p-2.5 bg-slate-100/90 rounded-xl text-[11px] text-slate-700 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">Background Stage:</span>{' '}
                      <span>{photocardResult.template.backgroundStyle}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBackgroundOnly(!showBackgroundOnly)}
                      className="ml-2 font-bold text-blue-600 hover:text-blue-800 underline text-[11px] whitespace-nowrap"
                    >
                      {showBackgroundOnly ? 'Show Full Photocard' : 'View Background'}
                    </button>
                  </div>
                )}

                {/* Photocard Image Container */}
                <div className="relative w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-[#02050c]">
                  {photocardResult?.finalImageUrl ? (
                    <img
                      src={showBackgroundOnly ? photocardResult.backgroundImage : photocardResult.finalImageUrl}
                      alt="AI Product Photocard"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-slate-900">
                      <span className="text-4xl mb-3">🎨</span>
                      <p className="text-sm font-bold">Your AI Photocard is Ready to Render</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        Enter your product details and click "Generate Post ✨" to composite the photocard.
                      </p>
                    </div>
                  )}

                  {generatingPhotocard && (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-2">
                      <svg className="animate-spin h-7 w-7 text-cyan-400" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span className="text-xs font-bold">Compositing Photocard with Sharp...</span>
                    </div>
                  )}
                </div>

                {/* Action Controls: Regenerate Background & Download */}
                <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRegenerateBackground}
                      disabled={regeneratingBg || generatingPhotocard}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <span>🎨</span> {regeneratingBg ? 'Generating Background...' : 'Regenerate Background'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isGenerating}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <span>🔄</span> Regenerate Photocard
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!photocardResult?.finalImageUrl}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition disabled:opacity-40"
                  >
                    <span>💾</span> Download Photocard
                  </button>
                </div>
              </div>

              {/* Full-width Publish to Facebook Button */}
              <button
                type="button"
                onClick={() => handlePublishClick(post.caption, index)}
                disabled={publishing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3.5 px-4 rounded-xl shadow-md transition active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 mt-4"
              >
                {publishing && activePublishIndex === index ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Publishing Caption & Photocard to Amar bazar Live...</span>
                  </>
                ) : (
                  <span>Publish to Facebook 🚀</span>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RAGPostGenerator;
