from openai import OpenAI

def api_call(model_output):
    output = None
    try:
        client = OpenAI(
            api_key="sk-amrprsxvkrdvshudmmlslcpavayenizgiizmfxxnvmasgecm",
            base_url="https://api.siliconflow.com/v1"
        )

        system_prompt = """
Your name is Blossom AI and You are a helpful agricultural assistant. You will receive plant disease predictions from an image analysis.

**When isInitialAnalysis is true:**
- Provide a comprehensive analysis of what might be affecting the plant
- Don't mention "model predictions" or "confidence scores"
- Speak naturally like a farming expert
- Focus on the most likely issues first
- Provide initial treatment recommendations
- Be encouraging and practical
- **IMPORTANT:** If nearbyPlaces data is available (provided below), you MUST include a section with specific local recommendations mentioning actual business names, phone numbers, and websites. This is MANDATORY in the initial response.

**When isInitialAnalysis is false:**
- Answer the user's specific question
- Use the provided disease information to inform your answer
- Reference the initial analysis if relevant
- Continue the conversation naturally

**MANDATORY LOCATION-AWARE RECOMMENDATIONS:**
**If nearbyPlaces array contains data:** You MUST include these places in your response, even in the initial analysis. Always:
- Use the actual nearby places data to make SPECIFIC recommendations
- Name actual places (pharmacies, agricultural stores) from the provided list
- Include their contact information (phone/website) when available
- Create a dedicated section or paragraph mentioning where to get treatment/supplies
- Make it clear these are real, nearby businesses the user can visit

**FORMAT FOR NEARBY PLACES (when available):**
Include a section like:
"**Where to Get Treatment:**
Near you, I found these resources:
1. [Business Name] - [Phone] - [Website]
2. [Business Name] - [Phone] - [Website]
(etc)"

When recommending, mention these places BY NAME and provide their contact details.

**Examples of good responses with nearbyPlaces:**
- "In Faisalabad, I found Khan Agricultural Store that can provide you with fungicide at +92-41-xxx. Their website is www.example.com. Also, Faisalabad Pharmacy at +92-41-yyy carries plant care products."
- "For your wheat leaf spot disease, I recommend visiting [Store Name] at [phone] where they have the specific treatment you need. I also found [Pharmacy Name] nearby at [phone]."

**For chickpeas the severity levels are:**
1: Highly Resistant (HR): The plant has been wilted by 0%-10%
3: Resistant (R): The plant has been wilted by 11%-20%
5: Moderately Resistant/Tolerant (MR): The plant has been wilted by 21%-30%
7: Susceptible (S): The plant has been wilted by 31%-50%
9: Highly Susceptible (HS): The plant has been wilted by more than 51%
The disease is Fusarium Wilt

**Always:**
- Respond in the user's preferred language (English or Urdu)
- Don't use technical jargon
- Naming specific places with Names and Contact info is VERY important.
- Focus on actionable advice
- In INITIAL ANALYSIS with nearbyPlaces: ALWAYS include specific place recommendations with phone and website
- Suggest consulting local experts for serious cases
"""
        
        # Parse the input to extract context
        import json
        try:
            context = json.loads(model_output)
        except:
            context = {"userQuestion": model_output}
        
        # Build user prompt with location context
        user_prompt = f"{model_output}"
        
        # Add location context if available
        if context.get("location_details"):
            location = context["location_details"]
            system_prompt += f"""
**User's Location:**
- City: {location.get('city', 'Unknown')}
- State/Region: {location.get('state', 'Unknown')}
- Country: {location.get('country', 'Unknown')}

Please provide location-specific recommendations based on this information.
"""
        
        # Add nearby places from Apify if available
        if context.get("nearbyPlaces") and len(context["nearbyPlaces"]) > 0:
            places = context["nearbyPlaces"]
            places_context = "\n**NEARBY BUSINESSES & SERVICES (From Local Search):**\n"
            for i, place in enumerate(places[:10], 1):  # Limit to 10 places
                places_context += f"\n{i}. {place.get('title', 'Unknown')}\n"
                if place.get('address'):
                    places_context += f"   Address: {place.get('address')}\n"
                if place.get('phone'):
                    places_context += f"   Phone: {place.get('phone')}\n"
                if place.get('website'):
                    places_context += f"   Website: {place.get('website')}\n"
                if place.get('type'):
                    places_context += f"   Type: {place.get('type')}\n"
            
            system_prompt += places_context + "\n\nWhen recommending solutions, refer to these nearby places by name and provide their contact information."

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        response = client.chat.completions.create(
            model="nex-agi/DeepSeek-V3.1-Nex-N1",
            messages=messages,
            temperature=0.6
        )

        output = response.choices[0].message.content

    except Exception as e:
        print("Some error while calling Deepseek:\n", e)

    return output