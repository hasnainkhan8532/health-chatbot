const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = "your api key";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function testAPI() {
    try {
        console.log('🔍 Testing Gemini API...');
        
        // Try different model names
        const modelsToTest = [
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'gemini-1.0-pro',
            'gemini-1.0-pro-001',
            'gemini-pro',
            'gemini-pro-vision',
            'gemini-2.0-pro',
            'gemini-2.0-flash'
        ];
        
        for (const modelName of modelsToTest) {
            try {
                console.log(`\n🔄 Testing ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                
                // Simple test
                const result = await model.generateContent('Hello');
                const response = await result.response;
                console.log(`✅ ${modelName} works! Response: "${response.text().substring(0, 50)}..."`);
                
                // If we get here, this model works
                console.log(`\n🎉 Found working model: ${modelName}`);
                return modelName;
                
            } catch (modelError) {
                if (modelError.message.includes('429')) {
                    console.log(`⏳ ${modelName} - Rate limited, waiting...`);
                    // Wait a bit before trying next model
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } else {
                    console.log(`❌ ${modelName} - ${modelError.message.split('[')[0]}`);
                }
            }
        }
        
        console.log('\n❌ No working models found');
        
    } catch (error) {
        console.error('❌ General API Error:', error.message);
    }
}

testAPI(); 