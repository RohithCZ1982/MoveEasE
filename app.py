from flask import Flask, render_template, request, jsonify
import json
import os
from datetime import datetime
import google.generativeai as genai

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False

# JSON file paths
PROFILES_FILE = 'data/profiles.json'
SERVICES_FILE = 'data/services.json'
NOTIFICATIONS_FILE = 'data/notifications.json'

# Initialize data directories and files
def init_data_files():
    os.makedirs('data', exist_ok=True)
    
    if not os.path.exists(PROFILES_FILE):
        with open(PROFILES_FILE, 'w', encoding='utf-8') as f:
            json.dump({}, f, indent=2, ensure_ascii=False)
    
    if not os.path.exists(SERVICES_FILE):
        default_services = {
            "gas": {"name": "Gas Provider", "category": "utilities"},
            "water": {"name": "Water Provider", "category": "utilities"},
            "electricity": {"name": "Electricity Provider", "category": "utilities"},
            "medicare": {"name": "Medicare", "category": "health"},
            "house_insurance": {"name": "House Insurance", "category": "insurance"},
            "private_insurance": {"name": "Private Insurance", "category": "insurance"},
            "car_rego": {"name": "Car Registration", "category": "transport"},
            "gp": {"name": "General Practitioner", "category": "health"},
            "internet": {"name": "Internet Provider", "category": "utilities"},
            "phone": {"name": "Phone Provider", "category": "utilities"},
            "bank": {"name": "Bank", "category": "finance"},
            "postal": {"name": "Postal Service", "category": "utilities"}
        }
        with open(SERVICES_FILE, 'w', encoding='utf-8') as f:
            json.dump(default_services, f, indent=2, ensure_ascii=False)
    
    if not os.path.exists(NOTIFICATIONS_FILE):
        with open(NOTIFICATIONS_FILE, 'w', encoding='utf-8') as f:
            json.dump([], f, indent=2, ensure_ascii=False)

# Load data from JSON files
def load_profiles():
    with open(PROFILES_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_profiles(data):
    with open(PROFILES_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def load_services():
    with open(SERVICES_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_notifications():
    with open(NOTIFICATIONS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_notifications(data):
    with open(NOTIFICATIONS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# Initialize Gemini AI (optional)
def init_gemini():
    api_key = os.getenv('GEMINI_API_KEY')
    if api_key:
        genai.configure(api_key=api_key)
        return genai.GenerativeModel('gemini-pro')
    return None

gemini_model = None

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/profiles')
def profiles():
    return render_template('profiles.html')

@app.route('/services')
def services():
    return render_template('services.html')

@app.route('/change-address')
def change_address():
    return render_template('change_address.html')

@app.route('/notifications')
def notifications():
    return render_template('notifications.html')

@app.route('/api/profiles', methods=['GET'])
def get_profiles():
    profiles = load_profiles()
    return jsonify(profiles)

@app.route('/api/profiles', methods=['POST'])
def create_profile():
    data = request.json
    profiles = load_profiles()
    
    profile_id = data.get('id') or f"profile_{len(profiles) + 1}"
    
    profile = {
        "id": profile_id,
        "name": data.get('name', ''),
        "email": data.get('email', ''),
        "phone": data.get('phone', ''),
        "current_address": data.get('current_address', ''),
        "previous_address": data.get('previous_address', ''),
        "services": data.get('services', {}),
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    profiles[profile_id] = profile
    save_profiles(profiles)
    
    return jsonify(profile), 201

@app.route('/api/profiles/<profile_id>', methods=['GET'])
def get_profile(profile_id):
    profiles = load_profiles()
    if profile_id in profiles:
        return jsonify(profiles[profile_id])
    return jsonify({"error": "Profile not found"}), 404

@app.route('/api/profiles/<profile_id>', methods=['PUT'])
def update_profile(profile_id):
    profiles = load_profiles()
    if profile_id not in profiles:
        return jsonify({"error": "Profile not found"}), 404
    
    data = request.json
    profile = profiles[profile_id]
    
    # Update profile fields
    for key in ['name', 'email', 'phone', 'current_address', 'previous_address', 'services']:
        if key in data:
            profile[key] = data[key]
    
    profile['updated_at'] = datetime.now().isoformat()
    save_profiles(profiles)
    
    return jsonify(profile)

@app.route('/api/profiles/<profile_id>', methods=['DELETE'])
def delete_profile(profile_id):
    profiles = load_profiles()
    if profile_id in profiles:
        del profiles[profile_id]
        save_profiles(profiles)
        return jsonify({"message": "Profile deleted"}), 200
    return jsonify({"error": "Profile not found"}), 404

@app.route('/api/services', methods=['GET'])
def get_services():
    services = load_services()
    return jsonify(services)

@app.route('/api/profiles/<profile_id>/services', methods=['POST'])
def add_service_to_profile(profile_id):
    profiles = load_profiles()
    if profile_id not in profiles:
        return jsonify({"error": "Profile not found"}), 404
    
    data = request.json
    service_key = data.get('service_key')
    service_details = data.get('service_details', {})
    
    if not service_key:
        return jsonify({"error": "Service key is required"}), 400
    
    if 'services' not in profiles[profile_id]:
        profiles[profile_id]['services'] = {}
    
    profiles[profile_id]['services'][service_key] = service_details
    profiles[profile_id]['updated_at'] = datetime.now().isoformat()
    save_profiles(profiles)
    
    return jsonify(profiles[profile_id])

@app.route('/api/profiles/<profile_id>/services/<service_key>', methods=['PUT'])
def update_service_in_profile(profile_id, service_key):
    profiles = load_profiles()
    if profile_id not in profiles:
        return jsonify({"error": "Profile not found"}), 404
    
    if 'services' not in profiles[profile_id] or service_key not in profiles[profile_id]['services']:
        return jsonify({"error": "Service not found"}), 404
    
    data = request.json
    service_details = profiles[profile_id]['services'][service_key]
    
    # Update service details
    for key in ['name', 'category', 'contact', 'email', 'phone', 'account', 'website']:
        if key in data:
            service_details[key] = data[key]
    
    profiles[profile_id]['updated_at'] = datetime.now().isoformat()
    save_profiles(profiles)
    
    return jsonify(profiles[profile_id])

@app.route('/api/profiles/<profile_id>/services/<service_key>', methods=['DELETE'])
def remove_service_from_profile(profile_id, service_key):
    profiles = load_profiles()
    if profile_id not in profiles:
        return jsonify({"error": "Profile not found"}), 404
    
    if 'services' in profiles[profile_id] and service_key in profiles[profile_id]['services']:
        del profiles[profile_id]['services'][service_key]
        profiles[profile_id]['updated_at'] = datetime.now().isoformat()
        save_profiles(profiles)
        return jsonify(profiles[profile_id])
    
    return jsonify({"error": "Service not found"}), 404

@app.route('/api/profiles/<profile_id>/change-address', methods=['POST'])
def change_address_api(profile_id):
    profiles = load_profiles()
    if profile_id not in profiles:
        return jsonify({"error": "Profile not found"}), 404
    
    data = request.json
    new_address = data.get('new_address')
    
    if not new_address:
        return jsonify({"error": "New address is required"}), 400
    
    profile = profiles[profile_id]
    old_address = profile.get('current_address', '')
    
    # Update address
    profile['previous_address'] = old_address
    profile['current_address'] = new_address
    profile['updated_at'] = datetime.now().isoformat()
    
    # Create notifications for all services
    notifications = load_notifications()
    service_list = profile.get('services', {})
    
    notification_results = []
    for service_key, service_details in service_list.items():
        # Collect contact information
        contact_parts = []
        if service_details.get('email'):
            contact_parts.append(f"Email: {service_details.get('email')}")
        if service_details.get('phone'):
            contact_parts.append(f"Phone: {service_details.get('phone')}")
        if service_details.get('contact'):
            contact_parts.append(service_details.get('contact'))
        if service_details.get('website'):
            contact_parts.append(f"Website: {service_details.get('website')}")
        
        contact_info = ' | '.join(contact_parts) if contact_parts else ''
        
        notification = {
            "id": f"notif_{len(notifications) + len(notification_results) + 1}",
            "profile_id": profile_id,
            "service_key": service_key,
            "service_name": service_details.get('name', service_key),
            "old_address": old_address,
            "new_address": new_address,
            "status": "pending",
            "created_at": datetime.now().isoformat(),
            "contact_info": contact_info,
            "email": service_details.get('email', '')
        }
        notification_results.append(notification)
        notifications.append(notification)
    
    save_profiles(profiles)
    save_notifications(notifications)
    
    return jsonify({
        "message": f"Address change notification sent to {len(notification_results)} services",
        "notifications": notification_results,
        "profile": profile
    })

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    profile_id = request.args.get('profile_id')
    notifications = load_notifications()
    
    if profile_id:
        notifications = [n for n in notifications if n.get('profile_id') == profile_id]
    
    return jsonify(notifications)

@app.route('/api/ai/suggest-services', methods=['POST'])
def suggest_services():
    global gemini_model
    
    if not gemini_model:
        return jsonify({"error": "Gemini AI not configured. Please set GEMINI_API_KEY environment variable."}), 503
    
    data = request.json
    profile_data = data.get('profile', {})
    current_services = data.get('current_services', [])
    
    prompt = f"""Based on the following profile information, suggest additional services that might need address change notifications when moving:

Profile:
- Name: {profile_data.get('name', 'N/A')}
- Current Address: {profile_data.get('current_address', 'N/A')}
- Current Services: {', '.join(current_services) if current_services else 'None'}

Please suggest 5-10 additional services that people typically need to notify when moving to a new address. 
Format your response as a JSON array of objects with 'key', 'name', and 'category' fields.
Example format:
[
  {{"key": "gym", "name": "Gym Membership", "category": "health"}},
  {{"key": "subscription", "name": "Magazine Subscription", "category": "media"}}
]

Only return the JSON array, no additional text."""
    
    try:
        response = gemini_model.generate_content(prompt)
        # Extract JSON from response
        response_text = response.text.strip()
        # Remove markdown code blocks if present
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]
        response_text = response_text.strip()
        
        suggested_services = json.loads(response_text)
        return jsonify({"suggestions": suggested_services})
    except Exception as e:
        return jsonify({"error": f"AI suggestion failed: {str(e)}"}), 500

if __name__ == '__main__':
    init_data_files()
    init_gemini()
    app.run(debug=True, port=5000)

