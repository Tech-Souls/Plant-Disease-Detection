from openai import OpenAI

def api_call(model_output):
    output = None
    try:
        client = OpenAI(
            api_key="sk-amrprsxvkrdvshudmmlslcpavayenizgiizmfxxnvmasgecm",
            base_url="https://api.siliconflow.com/v1"
        )

        system_prompt = """
You are a helpful agricultural assistant. You will receive plant disease predictions from an image analysis.

**When isInitialAnalysis is true:**
- Provide a comprehensive analysis of what might be affecting the plant
- Don't mention "model predictions" or "confidence scores"
- Speak naturally like a farming expert
- Focus on the most likely issues first
- Provide initial treatment recommendations
- Be encouraging and practical

**When isInitialAnalysis is false:**
- Answer the user's specific question
- Use the provided disease information to inform your answer
- Reference the initial analysis if relevant
- Continue the conversation naturally

**Always:**
- Respond in the user's preferred language (English or Urdu)
- Don't use technical jargon
- Focus on actionable advice
- Suggest consulting local experts for serious cases

for chickpeas the outputs
1: Highly Resistant (HR): The plant has been wilted by 0%-10%,
3: Resistant (R): The plant has been wilted by 11%-20%,
5: Moderately Resistant/ Tolerant (MR): The plant has been wilted by 21%-30%,
7: Susceptible (S): The plant has been wilted by 31%-50%,
9: Highly Susceptible (HS): The plant has been wilted by more than 51%.
The disease is Fusarium Wilt
"""
        user_prompt = f"""
Please analyze these plant disease prediction results and provide helpful advice:

{model_output}

Provide your answer in plain text format. Do not use JSON or markdown.
"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        response = client.chat.completions.create(
            model="nex-agi/DeepSeek-V3.1-Nex-N1",
            messages=messages
        )

        output = response.choices[0].message.content

    except Exception as e:
        print("Some error while calling Deepseek:\n", e)

    return output

print(api_call('{maize_blight: 100%}'))