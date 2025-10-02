#!/usr/bin/env python3
"""
Manual Meta (Facebook) Conversion Tracking Script
Use this to send conversion events to Meta Ads when customers actually pay.
"""

import requests
import hashlib
import time
import sys
import json
from datetime import datetime

# ===== CONFIGURATION =====
# Replace these with your actual values from Facebook Events Manager
PIXEL_ID = 'YOUR_PIXEL_ID_HERE'
ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_HERE'
API_VERSION = 'v18.0'

# ===== FUNCTIONS =====

def hash_user_data(data):
    """Hash user data for privacy compliance"""
    if not data:
        return None
    return hashlib.sha256(data.lower().strip().encode()).hexdigest()

def send_conversion(email, amount, plan_name=None, first_name=None, last_name=None, phone=None, event_name='Purchase'):
    """
    Send a manual conversion event to Meta
    
    Args:
        email: Customer email address
        amount: Transaction amount in USD
        plan_name: Name of the plan purchased (e.g., 'Teams Monthly', 'Starter Annual')
        first_name: Customer first name (optional)
        last_name: Customer last name (optional)
        phone: Customer phone number (optional)
        event_name: Type of event ('Purchase', 'Lead', 'CompleteRegistration', etc.)
    """
    
    url = f'https://graph.facebook.com/{API_VERSION}/{PIXEL_ID}/events'
    
    # Build user data with hashing
    user_data = {
        'em': hash_user_data(email),  # email is required
    }
    
    # Add optional fields if provided
    if first_name:
        user_data['fn'] = hash_user_data(first_name)
    if last_name:
        user_data['ln'] = hash_user_data(last_name)
    if phone:
        # Remove common phone formatting
        clean_phone = ''.join(filter(str.isdigit, phone))
        user_data['ph'] = hash_user_data(clean_phone)
    
    # Build the event payload
    event_data = {
        'event_name': event_name,
        'event_time': int(time.time()),
        'action_source': 'other',  # 'other' for manual/offline conversions
        'user_data': user_data,
        'custom_data': {
            'currency': 'USD',
            'value': float(amount)
        }
    }
    
    # Add plan name if provided
    if plan_name:
        event_data['custom_data']['content_name'] = plan_name
    
    # Add source URL for attribution
    event_data['event_source_url'] = 'https://withpotions.com'
    
    # Prepare the full payload
    payload = {
        'data': [event_data],
        'access_token': ACCESS_TOKEN
    }
    
    # Send the request
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        result = response.json()
        
        print(f"✅ SUCCESS: {event_name} event sent for {email}")
        print(f"   Amount: ${amount:.2f}")
        if plan_name:
            print(f"   Plan: {plan_name}")
        print(f"   Event ID: {result.get('events_received', 'N/A')}")
        print(f"   Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        return result
        
    except requests.exceptions.RequestException as e:
        print(f"❌ ERROR: Failed to send conversion")
        print(f"   Email: {email}")
        print(f"   Error: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print(f"   Response: {e.response.text}")
        return None

def send_batch_conversions(conversions):
    """
    Send multiple conversions at once
    
    Args:
        conversions: List of dictionaries with conversion data
                    Each should have: email, amount, and optionally plan_name, first_name, etc.
    """
    results = []
    for idx, conversion in enumerate(conversions, 1):
        print(f"\nProcessing conversion {idx}/{len(conversions)}...")
        result = send_conversion(**conversion)
        results.append(result)
        time.sleep(1)  # Small delay between requests
    
    successful = sum(1 for r in results if r is not None)
    print(f"\n📊 Batch complete: {successful}/{len(conversions)} successful")
    return results

def test_connection():
    """Test if the API credentials are working"""
    url = f'https://graph.facebook.com/{API_VERSION}/{PIXEL_ID}?access_token={ACCESS_TOKEN}'
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        pixel_info = response.json()
        print(f"✅ Connection successful!")
        print(f"   Pixel ID: {pixel_info.get('id', 'N/A')}")
        print(f"   Pixel Name: {pixel_info.get('name', 'N/A')}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection failed!")
        print(f"   Error: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print(f"   Response: {e.response.text}")
        return False

# ===== MAIN EXECUTION =====

if __name__ == "__main__":
    print("Meta Conversion Tracking Script")
    print("================================\n")
    
    # Check if credentials are configured
    if PIXEL_ID == 'YOUR_PIXEL_ID_HERE' or ACCESS_TOKEN == 'YOUR_ACCESS_TOKEN_HERE':
        print("⚠️  Please configure your PIXEL_ID and ACCESS_TOKEN in this script first!")
        print("   Get these from Facebook Events Manager → Settings → Conversions API")
        sys.exit(1)
    
    # Test connection first
    print("Testing connection to Meta...")
    if not test_connection():
        sys.exit(1)
    
    print("\n" + "="*50 + "\n")
    
    # Example: Send a single conversion
    print("Example 1: Sending single conversion...")
    send_conversion(
        email="customer@example.com",
        amount=150.00,
        plan_name="Teams Monthly",
        first_name="John",
        last_name="Doe",
        event_name="Purchase"
    )
    
    print("\n" + "="*50 + "\n")
    
    # Example: Send multiple conversions
    print("Example 2: Sending batch conversions...")
    batch_data = [
        {
            "email": "alice@example.com",
            "amount": 120.00,
            "plan_name": "Starter Annual",
            "event_name": "Purchase"
        },
        {
            "email": "bob@example.com",
            "amount": 249.00,
            "plan_name": "Teams Annual",
            "first_name": "Bob",
            "last_name": "Smith",
            "event_name": "Purchase"
        }
    ]
    
    # Uncomment to run batch example
    # send_batch_conversions(batch_data)
    
    print("\n" + "="*50)
    print("\n📌 Quick Usage Examples:")
    print("\nIn Python interpreter or another script:")
    print(">>> from send_meta_conversion import send_conversion")
    print(">>> send_conversion('customer@email.com', 150.00, 'Teams Plan')")
    print("\nFor a lead (not purchase):")
    print(">>> send_conversion('lead@email.com', 0, event_name='Lead')")
    print("\nFor a trial signup:")
    print(">>> send_conversion('trial@email.com', 0, event_name='StartTrial')")