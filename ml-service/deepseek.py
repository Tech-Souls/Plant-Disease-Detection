from openai import OpenAI

def api_call(model_output):
    output = None
    try:
        client = OpenAI(
            api_key="pass",
            base_url="https://api.deepseek.com"
        )

        system_prompt = """
You are an AI that interprets the output of a plant disease classification model.
Return your interpretation as a JSON object with one key: "interpretation".
"""
        user_prompt = f"""
Interpret these results of the model: {model_output}
Provide the answer in JSON format.
"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=messages,
            response_format={'type': 'json_object'}
        )

        output = response.choices[0].message.content

    except Exception as e:
        print("Some error while calling Deepseek:\n", e)

    return output

