#!/usr/bin/env python3
"""
Setup script to create .env file for backend
"""

import os

def create_env_file():
    print("Setting up environment variables for backend...")
    
    # Get Supabase credentials from user
    supabase_url = input("Enter your Supabase URL (from your .env.local): ").strip()
    if not supabase_url:
        print("Using default Supabase URL from your frontend config...")
        supabase_url = "https://hngiwvjubrgkslumyxis.supabase.co"
    
    supabase_key = input("Enter your Supabase Service Role Key: ").strip()
    if not supabase_key:
        print("Please get your Service Role Key from Supabase Dashboard > Settings > API")
        return False
    
    groq_key = input("Enter your Groq API Key (or press Enter to skip): ").strip()
    if not groq_key:
        groq_key = "your_groq_api_key"
    
    # Create .env file
    env_content = f"""# Supabase Configuration
SUPABASE_URL={supabase_url}
SUPABASE_SERVICE_ROLE_KEY={supabase_key}

# Groq AI Configuration
GROQ_API_KEY={groq_key}

# Server Configuration
HOST=0.0.0.0
PORT=8000
"""
    
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✅ .env file created successfully!")
    print("You can now run: python main.py")
    return True

if __name__ == "__main__":
    create_env_file()
