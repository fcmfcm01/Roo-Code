import { OpenAICompatibleEmbedder } from "../embedders/openai-compatible"
import { CodeIndexConfigManager } from "../config-manager"

describe("Azure Configuration", () => {
	it("should create OpenAICompatibleEmbedder with Azure settings", () => {
		const embedder = new OpenAICompatibleEmbedder(
			"https://api.openai.com",
			"test-api-key",
			"text-embedding-3-small",
			8191,
			true, // isAzure
			"https://my-resource.openai.azure.com",
			"my-deployment",
			"2023-05-15"
		)

		expect(embedder).toBeDefined()
		const info = embedder.embedderInfo
		expect(info.name).toBe("azure-openai")
		expect(info.provider).toBe("azure")
		expect(info.endpoint).toBe("https://my-resource.openai.azure.com")
		expect(info.deployment).toBe("my-deployment")
	})

	it("should handle Azure configuration in config manager", () => {
		const mockContextProxy = {
			getGlobalState: jest.fn(() => ({
				codebaseIndexEnabled: true,
				codebaseIndexQdrantUrl: "http://localhost:6333",
				codebaseIndexEmbedderProvider: "openai-compatible",
				codebaseIndexOpenAiCompatibleBaseUrl: "https://api.openai.com",
				codebaseIndexOpenAiCompatibleUseAzure: true,
				codebaseIndexAzureEndpointUrl: "https://my-resource.openai.azure.com",
				codebaseIndexAzureDeploymentName: "my-deployment",
				codebaseIndexAzureApiVersion: "2023-05-15",
			})),
			getSecret: jest.fn(() => "test-api-key"),
			refreshSecrets: jest.fn(),
		}

		const configManager = new CodeIndexConfigManager(mockContextProxy as any)
		const config = configManager.getConfig()

		expect(config.embedderProvider).toBe("openai-compatible")
		expect(config.openAiCompatibleOptions?.useAzure).toBe(true)
		expect(config.openAiCompatibleOptions?.azureEndpointUrl).toBe("https://my-resource.openai.azure.com")
		expect(config.openAiCompatibleOptions?.azureDeploymentName).toBe("my-deployment")
		expect(config.openAiCompatibleOptions?.azureApiVersion).toBe("2023-05-15")
	})
})