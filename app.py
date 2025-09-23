#!/usr/bin/env python3
"""
Flask CRUD Dashboard for Forza Products
A comprehensive web interface for managing product information, images, and benefits.
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, send_from_directory
import json
import os
import re
from pathlib import Path
import shutil

app = Flask(__name__)
app.secret_key = 'forza_products_dashboard_secret_key_2025'

# Global data storage
PRODUCTS_FILE = 'forza_products_organized.json'
IMAGES_DIR = 'product-images'

def load_products():
    """Load products from JSON file."""
    try:
        with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"forza_products_organized": {"metadata": {}, "forza_bond": {}, "forza_seal": {}, "forza_tape": {}}}

def save_products(data):
    """Save products to JSON file."""
    with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def get_all_products_flat():
    """Get all products in a flat list for easier management."""
    data = load_products()
    all_products = []
    
    for brand_key, brand_data in data['forza_products_organized'].items():
        if brand_key == 'metadata':
            continue
            
        if 'products' not in brand_data:
            continue
            
        for industry_key, industry_data in brand_data['products'].items():
            if 'products' not in industry_data:
                continue
                
            for product in industry_data['products']:
                # Create a normalized product structure for frontend compatibility
                # Extract product ID from name (e.g., "ForzaBOND® 81-0389 – ..." -> "81-0389")
                product_name = product.get('name', '')
                product_id = ''
                if product_name:
                    # Try to extract product ID from various patterns
                    # Pattern 1: Find product codes like "81-0389", "CA1000", "A450", etc.
                    match = re.search(r'([A-Z0-9]+[-]?[A-Z0-9]+)', product_name)
                    if match:
                        product_id = match.group(1)
                    else:
                        # Fallback: use a cleaned version of the name
                        product_id = re.sub(r'[^\w\-]', '', product_name.split('–')[0].split('-')[0].strip())
                        product_id = product_id.replace('ForzaBOND', '').replace('ForzaSEAL', '').replace('ForzaTAPE', '').strip()
                        if not product_id:
                            product_id = product_name[:20]  # Use first 20 chars as fallback
                
                normalized_product = {
                    'product_id': product_id,
                    'id': product_id,  # For backward compatibility
                    'name': product.get('name', ''),
                    'full_name': product.get('name', ''),  # Use name as full_name if not provided
                    'description': product.get('description', ''),
                    'brand': brand_key,
                    'industry': industry_key,
                    'chemistry': product.get('chemistry', ''),
                    'url': product.get('url', ''),
                    'image': product.get('image_url', product.get('image', '')),
                    'benefits': product.get('benefits', []),
                    'applications': product.get('applications', []),
                    'technical': product.get('technical', []),
                    'sizing': product.get('sizing', {}),
                    'packaging': product.get('packaging', []),
                    'published': isinstance(product.get('published'), str) or product.get('published', True),  # Convert date string to boolean
                    'benefits_count': len(product.get('benefits', []))
                }
                all_products.append(normalized_product)
    
    return all_products

def find_product_by_identifier(identifier):
    """Find a product by its ID or name."""
    products_list = get_all_products_flat()
    for product in products_list:
        if (product.get('product_id') == identifier or 
            product.get('name') == identifier):
            return product
    return None

def find_product_location_in_data(data, product_identifier):
    """Find where a product is located in the data structure."""
    for brand_key, brand_data in data['forza_products_organized'].items():
        if brand_key == 'metadata':
            continue
            
        for industry_key, industry_data in brand_data['products'].items():
            for i, product in enumerate(industry_data['products']):
                if (product.get('product_id') == product_identifier or 
                    product.get('name') == product_identifier):
                    return brand_key, industry_key, i
    return None, None, None

@app.route('/')
def index():
    """Main dashboard page."""
    data = load_products()
    stats = data['forza_products_organized']['metadata']
    
    # Count products by brand
    brand_counts = {}
    for brand_key, brand_data in data['forza_products_organized'].items():
        if brand_key == 'metadata':
            continue
        total = sum(len(industry_data['products']) for industry_data in brand_data['products'].values())
        brand_counts[brand_key] = total
    
    return render_template('index.html', stats=stats, brand_counts=brand_counts)

@app.route('/products')
def products():
    """Products listing page."""
    products_list = get_all_products_flat()
    return render_template('products.html', products=products_list)

@app.route('/product/<product_identifier>')
def product_detail(product_identifier):
    """Individual product detail/edit page."""
    product = find_product_by_identifier(product_identifier)
    if product:
        return render_template('product_detail_new.html', product=product, is_new_product=False)
    return redirect(url_for('products'))

@app.route('/product/new')
def new_product():
    """Create new product page."""
    empty_product = {
        'product_id': '',
        'full_name': '',
        'description': '',
        'url': '',
        'brand': '',
        'industry': '',
        'chemistry': '',
        'image': '',
        'published': False,
        'benefits': [],
        'applications': [],
        'technical': []
    }
    return render_template('product_detail_new.html', product=empty_product, is_new_product=True)

@app.route('/api/products', methods=['GET'])
def api_get_products():
    """API endpoint to get all products."""
    products_list = get_all_products_flat()
    return jsonify(products_list)

@app.route('/api/product/<product_identifier>', methods=['GET'])
def api_get_product(product_identifier):
    """API endpoint to get a single product by ID."""
    try:
        product = find_product_by_identifier(product_identifier)
        if not product:
            return jsonify({"error": "Product not found"}), 404
        return jsonify(product)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/product/<product_identifier>', methods=['PUT'])
def api_update_product(product_identifier):
    """API endpoint to update a product."""
    try:
        data = load_products()
        product = find_product_by_identifier(product_identifier)
        
        if not product:
            return jsonify({"success": False, "message": "Product not found"}), 404
        
        # Find current location
        old_brand, old_industry, old_index = find_product_location_in_data(data, product_identifier)
        if old_brand is None:
            return jsonify({"success": False, "message": "Product location not found"}), 404
        
        # Update product data
        update_data = request.json
        
        for key, value in update_data.items():
            if key in ['name', 'url', 'benefits', 'image', 'brand', 'industry', 'chemistry', 'applications', 'technical', 'published', 'product_id', 'full_name', 'description', 'sizing', 'last_edited']:
                product[key] = value
        
        # Update benefits count
        if 'benefits' in update_data:
            product['benefits_count'] = len(update_data['benefits'])
        
        # Check if brand or industry changed
        new_brand = product.get('brand', old_brand)
        new_industry = product.get('industry', old_industry)
        
        # If brand or industry changed, move the product
        if new_brand != old_brand or new_industry != old_industry:
            # Remove from old location
            data['forza_products_organized'][old_brand]['products'][old_industry]['products'].pop(old_index)
            
            # Add to new location
            if new_brand in data['forza_products_organized'] and new_industry in data['forza_products_organized'][new_brand]['products']:
                data['forza_products_organized'][new_brand]['products'][new_industry]['products'].append(product)
            else:
                # Fallback: add back to old location if new location is invalid
                data['forza_products_organized'][old_brand]['products'][old_industry]['products'].append(product)
        else:
            # Update in place
            data['forza_products_organized'][old_brand]['products'][old_industry]['products'][old_index] = product
        
        save_products(data)
        return jsonify({"success": True, "message": "Product updated successfully"})
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/product/<product_identifier>', methods=['DELETE'])
def api_delete_product(product_identifier):
    """API endpoint to delete a product."""
    try:
        data = load_products()
        
        # Find product location
        brand, industry, index = find_product_location_in_data(data, product_identifier)
        if brand is None:
            return jsonify({"success": False, "message": "Product not found"}), 404
        
        # Remove product
        data['forza_products_organized'][brand]['products'][industry]['products'].pop(index)
        
        save_products(data)
        return jsonify({"success": True, "message": "Product deleted successfully"})
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/products', methods=['POST'])
def api_create_product():
    """API endpoint to create a new product."""
    try:
        data = load_products()
        product_data = request.json
        
        # Validate required fields
        if not product_data.get('product_id'):
            return jsonify({"success": False, "message": "Product ID is required"}), 400
        
        if not product_data.get('brand'):
            return jsonify({"success": False, "message": "Brand is required"}), 400
        
        if not product_data.get('industry'):
            return jsonify({"success": False, "message": "Industry is required"}), 400
        
        # Check if product ID already exists
        existing_product = find_product_by_identifier(product_data['product_id'])
        if existing_product:
            return jsonify({"success": False, "message": "Product ID already exists"}), 400
        
        # Create new product
        new_product = {
            'product_id': product_data.get('product_id'),
            'name': product_data.get('product_id'),  # Use product_id as name for compatibility
            'full_name': product_data.get('full_name', ''),
            'description': product_data.get('description', ''),
            'url': product_data.get('url', ''),
            'brand': product_data.get('brand'),
            'industry': product_data.get('industry'),
            'chemistry': product_data.get('chemistry', ''),
            'image': product_data.get('image', ''),
            'published': product_data.get('published', False),
            'benefits': product_data.get('benefits', []),
            'applications': product_data.get('applications', []),
            'technical': product_data.get('technical', []),
            'benefits_count': len(product_data.get('benefits', [])),
            'last_edited': product_data.get('last_edited', '')
        }
        
        # Add to appropriate location
        brand = product_data['brand']
        industry = product_data['industry']
        
        if brand in data['forza_products_organized'] and industry in data['forza_products_organized'][brand]['products']:
            data['forza_products_organized'][brand]['products'][industry]['products'].append(new_product)
        else:
            return jsonify({"success": False, "message": "Invalid brand or industry"}), 400
        
        save_products(data)
        return jsonify({
            "success": True, 
            "message": "Product created successfully",
            "product_id": new_product['product_id']
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/upload_image', methods=['POST'])
def upload_image():
    """Handle image uploads."""
    try:
        if 'image' not in request.files:
            return jsonify({"success": False, "message": "No image file"}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({"success": False, "message": "No selected file"}), 400
        
        if file:
            # Ensure images directory exists
            os.makedirs(IMAGES_DIR, exist_ok=True)
            
            # Save file
            filename = file.filename
            filepath = os.path.join(IMAGES_DIR, filename)
            file.save(filepath)
            
            return jsonify({
                "success": True, 
                "message": "Image uploaded successfully",
                "filename": filename,
                "filepath": filepath
            })
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/statistics')
def api_statistics():
    """API endpoint to get dashboard statistics."""
    data = load_products()
    stats = data['forza_products_organized']['metadata']
    
    # Count products by brand and industry
    brand_industry_counts = {}
    for brand_key, brand_data in data['forza_products_organized'].items():
        if brand_key == 'metadata':
            continue
            
        brand_industry_counts[brand_key] = {}
        for industry_key, industry_data in brand_data['products'].items():
            brand_industry_counts[brand_key][industry_key] = len(industry_data['products'])
    
    return jsonify({
        "metadata": stats,
        "brand_industry_counts": brand_industry_counts
    })

@app.route('/product-images/<path:filename>')
def serve_product_image(filename):
    """Serve product images from the product-images directory."""
    return send_from_directory(IMAGES_DIR, filename)

@app.route('/api/images')
def api_get_images():
    """API endpoint to get list of available images."""
    try:
        if not os.path.exists(IMAGES_DIR):
            return jsonify([])
        
        images = []
        for file in os.listdir(IMAGES_DIR):
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                images.append({
                    'filename': file,
                    'path': f'/product-images/{file}',
                    'size': os.path.getsize(os.path.join(IMAGES_DIR, file))
                })
        
        return jsonify(images)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
