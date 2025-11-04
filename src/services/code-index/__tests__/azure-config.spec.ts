// npx vitest services/code-index/__tests__/azure-config.spec.ts

import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock ContextProxy
vi.mock("../../../core/config/ContextProxy")

// Mock embeddingModels module
vi.mock("../../../shared/embeddingModels")

// Mock the constants module to avoid @roo-code/types import issues
vi.mock("../constants", () => ({
	MAX_BLOCK_CHARS: 1000,
	MIN_BLOCK_CHARS: 50,
	MIN_CHUNK_REMAINDER_CHARS: 200,
	MAX_CHARS_TOLERANCE_FACTOR: 1.15,
	DEFAULT_SEARCH_MIN_SCORE: 0.4,
	DEFAULT_MAX_SEARCH_RESULTS: 100,
	QDRANT_CODE_BLOCK_NAMESPACE: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
	MAX_FILE_SIZE_BYTES: 1 * 1024 * 1024,
	MAX_LIST_FILES_LIMIT_CODE_INDEX: 50000,
	BATCH_SEGMENT_THRESHOLD: 60,
	MAX_BATCH_RETRIES: 3,
	INITIAL_RETRY_DELAY_MS: 500,
	PARSING_CONCURRENCY: 10,
	MAX_PENDING_BATCHES: 20,
	MAX_BATCH_TOKENS: 100000,
	MAX_ITEM_TOKENS: 8191,
	BATCH_PROCESSING_CONCURRENCY: 10,
	GEMINI_MAX_ITEM_TOKENS: 2048,
}))

import { CodeIndexConfigManager } from "../config-manager"
import { OpenAICompatibleEmbedder } from "../embedders/openai-compatible"

// Mock OpenAICompatibleEmbedder
vi.mock("../embedders/openai-compatible", () => ({
	OpenAICompatibleEmbedder: vi.fn().mockImplementation((config) => ({
		config,
		isConfigured: true,
		embed: vi.fn(),
	})),
}))

describe("Azure Configuration", () => {
	let mockContextProxy: any
	let configManager: CodeIndexConfigManager

	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks()

		// Setup mock ContextProxy
		mockContextProxy = {
			getGlobalState: vi.fn(),
			getSecret: vi.fn().mockReturnValue(undefined),
			refreshSecrets: vi.fn().mockResolvedValue(undefined),
			updateGlobalState: vi.fn(),
		}

		configManager = new CodeIndexConfigManager(mockContextProxy)
	})

	describe("OpenAICompatibleEmbedder with Azure settings", () => {
		it("should initialize with Azure parameters when useAzure is true", async () => {
			const mockGlobalState = {
				codebaseIndexEnabled: true,
				codebaseIndexQdrantUrl: "http://localhost:6333",
				codebaseIndexEmbedderProvider: "openai-compatible",
				codebaseIndexEmbedderBaseUrl: "",
				codebaseIndexEmbedderModelId: "text-embedding-3-large",
				codebaseIndexOpenAiCompatibleBaseUrl: "https://api.openai.com/v1",
				codebaseIndexOpenAiCompatibleUseAzure: true,
				codebaseIndexAzureEndpointUrl: "https://myresource.openai.azure.com",
				codebaseIndexAzureDeploymentName: "text-embedding-3-large",
				codebaseIndexAzureApiVersion: "2023-05-15",
			}

			mockContextProxy.getGlobalState.mockImplementation((key: string) => {
				if (key === "codebaseIndexConfig") return mockGlobalState
				return undefined
			})

			mockContextProxy.getSecret.mockImplementation((key: string) => {
				if (key === "codebaseIndexOpenAiCompatibleApiKey") return "test-azure-key"
				if (key === "codeIndexQdrantApiKey") return "test-qdrant-key"
				return undefined
			})

			await configManager.loadConfiguration()

			// Verify the config manager has the Azure settings
		const config = await configManager.loadConfiguration()
		expect(config.currentConfig.openAiCompatibleOptions?.useAzure).toBe(true)
		expect(config.currentConfig.openAiCompatibleOptions?.azureEndpointUrl).toBe("https://myresource.openai.azure.com")
		expect(config.currentConfig.openAiCompatibleOptions?.azureDeploymentName).toBe("text-embedding-3-large")
		expect(config.currentConfig.openAiCompatibleOptions?.azureApiVersion).toBe("2023-05-15")
		})

		it("should handle Azure configuration changes that require restart", async () => {
		// Set up the current configuration with Azure settings
		const mockGlobalState = {
			codebaseIndexEnabled: true,
			codebaseIndexQdrantUrl: "http://localhost:6333",
			codebaseIndexEmbedderProvider: "openai-compatible",
			codebaseIndexEmbedderBaseUrl: "",
			codebaseIndexEmbedderModelId: "text-embedding-3-large",
			codebaseIndexOpenAiCompatibleBaseUrl: "https://api.openai.com/v1",
			codebaseIndexOpenAiCompatibleUseAzure: true,
			codebaseIndexAzureEndpointUrl: "https://myresource.openai.azure.com",
			codebaseIndexAzureDeploymentName: "text-embedding-3-large",
			codebaseIndexAzureApiVersion: "2023-05-15",
		}

		mockContextProxy.getGlobalState.mockImplementation((key: string) => {
			if (key === "codebaseIndexConfig") return mockGlobalState
			return undefined
		})

		mockContextProxy.getSecret.mockImplementation((key: string) => {
			if (key === "codebaseIndexOpenAiCompatibleApiKey") return "test-azure-key"
			if (key === "codeIndexQdrantApiKey") return "test-qdrant-key"
			return undefined
		})

		await configManager.loadConfiguration()

		// Create previous config snapshot (without Azure)
		const previousConfig = {
			enabled: true,
			configured: true,
			embedderProvider: "openai-compatible",
			modelId: "text-embedding-3-large",
			modelDimension: 1536,
			openAiKey: "",
			ollamaBaseUrl: "",
			openAiCompatibleBaseUrl: "https://api.openai.com/v1",
			openAiCompatibleApiKey: "test-azure-key",
			openAiCompatibleUseAzure: false, // This is the key change
			azureEndpointUrl: "",
			azureDeploymentName: "",
			azureApiVersion: "",
			geminiApiKey: "",
			mistralApiKey: "",
			vercelAiGatewayApiKey: "",
			openRouterApiKey: "",
			qdrantUrl: "http://localhost:6333",
			qdrantApiKey: "test-qdrant-key",
		}

		const requiresRestart = configManager.doesConfigChangeRequireRestart(previousConfig)

		expect(requiresRestart).toBe(true)
	})

		it("should handle Azure endpoint URL changes that require restart", async () => {
		// Set up the current configuration with Azure settings
		const mockGlobalState = {
			codebaseIndexEnabled: true,
			codebaseIndexQdrantUrl: "http://localhost:6333",
			codebaseIndexEmbedderProvider: "openai-compatible",
			codebaseIndexEmbedderBaseUrl: "",
			codebaseIndexEmbedderModelId: "text-embedding-3-large",
			codebaseIndexOpenAiCompatibleBaseUrl: "https://api.openai.com/v1",
			codebaseIndexOpenAiCompatibleUseAzure: true,
			codebaseIndexAzureEndpointUrl: "https://newresource.openai.azure.com",
			codebaseIndexAzureDeploymentName: "text-embedding-3-large",
			codebaseIndexAzureApiVersion: "2023-05-15",
		}

		mockContextProxy.getGlobalState.mockImplementation((key: string) => {
			if (key === "codebaseIndexConfig") return mockGlobalState
			return undefined
		})

		mockContextProxy.getSecret.mockImplementation((key: string) => {
			if (key === "codebaseIndexOpenAiCompatibleApiKey") return "test-azure-key"
			if (key === "codeIndexQdrantApiKey") return "test-qdrant-key"
			return undefined
		})

		await configManager.loadConfiguration()

		// Create previous config snapshot (with different Azure endpoint)
		const previousConfig = {
			enabled: true,
			configured: true,
			embedderProvider: "openai-compatible",
			modelId: "text-embedding-3-large",
			modelDimension: 1536,
			openAiKey: "",
			ollamaBaseUrl: "",
			openAiCompatibleBaseUrl: "https://api.openai.com/v1",
			openAiCompatibleApiKey: "test-azure-key",
			openAiCompatibleUseAzure: true,
			azureEndpointUrl: "https://oldresource.openai.azure.com", // This is the key change
			azureDeploymentName: "text-embedding-3-large",
			azureApiVersion: "2023-05-15",
			geminiApiKey: "",
			mistralApiKey: "",
			vercelAiGatewayApiKey: "",
			openRouterApiKey: "",
			qdrantUrl: "http://localhost:6333",
			qdrantApiKey: "test-qdrant-key",
		}

		const requiresRestart = configManager.doesConfigChangeRequireRestart(previousConfig)

		expect(requiresRestart).toBe(true)
	})

		it("should handle Azure deployment name changes that require restart", async () => {
		// Set up the current configuration with Azure settings
		const mockGlobalState = {
			codebaseIndexEnabled: true,
			codebaseIndexQdrantUrl: "http://localhost:6333",
			codebaseIndexEmbedderProvider: "openai-compatible",
			codebaseIndexEmbedderBaseUrl: "",
			codebaseIndexEmbedderModelId: "text-embedding-3-large",
			codebaseIndexOpenAiCompatibleBaseUrl: "https://api.openai.com/v1",
			codebaseIndexOpenAiCompatibleUseAzure: true,
			codebaseIndexAzureEndpointUrl: "https://myresource.openai.azure.com",
			codebaseIndexAzureDeploymentName: "new-deployment",
			codebaseIndexAzureApiVersion: "2023-05-15",
		}

		mockContextProxy.getGlobalState.mockImplementation((key: string) => {
			if (key === "codebaseIndexConfig") return mockGlobalState
			return undefined
		})

		mockContextProxy.getSecret.mockImplementation((key: string) => {
			if (key === "codebaseIndexOpenAiCompatibleApiKey") return "test-azure-key"
			if (key === "codeIndexQdrantApiKey") return "test-qdrant-key"
			return undefined
		})

		await configManager.loadConfiguration()

		// Create previous config snapshot (with different deployment name)
		const previousConfig = {
			enabled: true,
			configured: true,
			embedderProvider: "openai-compatible",
			modelId: "text-embedding-3-large",
			modelDimension: 1536,
			openAiKey: "",
			ollamaBaseUrl: "",
			openAiCompatibleBaseUrl: "https://api.openai.com/v1",
			openAiCompatibleApiKey: "test-azure-key",
			openAiCompatibleUseAzure: true,
			azureEndpointUrl: "https://myresource.openai.azure.com",
			azureDeploymentName: "old-deployment", // This is the key change
			azureApiVersion: "2023-05-15",
			geminiApiKey: "",
			mistralApiKey: "",
			vercelAiGatewayApiKey: "",
			openRouterApiKey: "",
			qdrantUrl: "http://localhost:6333",
			qdrantApiKey: "test-qdrant-key",
		}

		const requiresRestart = configManager.doesConfigChangeRequireRestart(previousConfig)

		expect(requiresRestart).toBe(true)
	})

	it("should handle Azure API version changes that require restart", async () => {
		// Set up the current configuration with Azure settings
		const mockGlobalState = {
			codebaseIndexEnabled: true,
			codebaseIndexQdrantUrl: "http://localhost:6333",
			codebaseIndexEmbedderProvider: "openai-compatible",
			codebaseIndexEmbedderBaseUrl: "",
			codebaseIndexEmbedderModelId: "text-embedding-3-large",
			codebaseIndexOpenAiCompatibleBaseUrl: "https://api.openai.com/v1",
			codebaseIndexOpenAiCompatibleUseAzure: true,
			codebaseIndexAzureEndpointUrl: "https://myresource.openai.azure.com",
			codebaseIndexAzureDeploymentName: "text-embedding-3-large",
			codebaseIndexAzureApiVersion: "2024-02-15",
		}

		mockContextProxy.getGlobalState.mockImplementation((key: string) => {
			if (key === "codebaseIndexConfig") return mockGlobalState
			return undefined
		})

		mockContextProxy.getSecret.mockImplementation((key: string) => {
			if (key === "codebaseIndexOpenAiCompatibleApiKey") return "test-azure-key"
			if (key === "codeIndexQdrantApiKey") return "test-qdrant-key"
			return undefined
		})

		await configManager.loadConfiguration()

		// Create previous config snapshot (with different API version)
		const previousConfig = {
			enabled: true,
			configured: true,
			embedderProvider: "openai-compatible",
			modelId: "text-embedding-3-large",
			modelDimension: 1536,
			openAiKey: "",
			ollamaBaseUrl: "",
			openAiCompatibleBaseUrl: "https://api.openai.com/v1",
			openAiCompatibleApiKey: "test-azure-key",
			openAiCompatibleUseAzure: true,
			azureEndpointUrl: "https://myresource.openai.azure.com",
			azureDeploymentName: "text-embedding-3-large",
			azureApiVersion: "2023-05-15", // This is the key change
			geminiApiKey: "",
			mistralApiKey: "",
			vercelAiGatewayApiKey: "",
			openRouterApiKey: "",
			qdrantUrl: "http://localhost:6333",
			qdrantApiKey: "test-qdrant-key",
		}

		const requiresRestart = configManager.doesConfigChangeRequireRestart(previousConfig)

		expect(requiresRestart).toBe(true)
	})

		it("should not require restart when Azure settings remain unchanged", async () => {
			const previousConfig = {
				openAiCompatibleUseAzure: true,
				azureEndpointUrl: "https://myresource.openai.azure.com",
				azureDeploymentName: "text-embedding-3-large",
				azureApiVersion: "2023-05-15",
				embedderProvider: "openai-compatible",
				modelId: "text-embedding-3-large",
				qdrantUrl: "http://localhost:6333",
			}

			const currentConfig = {
				openAiCompatibleUseAzure: true,
				azureEndpointUrl: "https://myresource.openai.azure.com",
				azureDeploymentName: "text-embedding-3-large",
				azureApiVersion: "2023-05-15",
				embedderProvider: "openai-compatible",
				modelId: "text-embedding-3-large",
				qdrantUrl: "http://localhost:6333",
			}

			const requiresRestart = configManager.doesConfigChangeRequireRestart(
				previousConfig,
				currentConfig
			)

			expect(requiresRestart).toBe(false)
		})
	})

	describe("Service Factory Azure Integration", () => {
		it("should pass Azure parameters to OpenAICompatibleEmbedder", async () => {
			const mockGlobalState = {
				codebaseIndexEnabled: true,
				codebaseIndexQdrantUrl: "http://localhost:6333",
				codebaseIndexEmbedderProvider: "openai-compatible",
				codebaseIndexEmbedderBaseUrl: "",
				codebaseIndexEmbedderModelId: "text-embedding-3-large",
				codebaseIndexOpenAiCompatibleBaseUrl: "https://api.openai.com/v1",
				codebaseIndexOpenAiCompatibleUseAzure: true,
				codebaseIndexAzureEndpointUrl: "https://myresource.openai.azure.com",
				codebaseIndexAzureDeploymentName: "text-embedding-3-large",
				codebaseIndexAzureApiVersion: "2023-05-15",
			}

			mockContextProxy.getGlobalState.mockImplementation((key: string) => {
				if (key === "codebaseIndexConfig") return mockGlobalState
				return undefined
			})

			mockContextProxy.getSecret.mockImplementation((key: string) => {
				if (key === "codebaseIndexOpenAiCompatibleApiKey") return "test-azure-key"
				if (key === "codeIndexQdrantApiKey") return "test-qdrant-key"
				return undefined
			})

			await configManager.loadConfiguration()

			// Get the current config to verify Azure settings are included
			const currentConfig = configManager.getConfig()

			expect(currentConfig.openAiCompatibleOptions).toBeDefined()
			expect(currentConfig.openAiCompatibleOptions?.useAzure).toBe(true)
			expect(currentConfig.openAiCompatibleOptions?.azureEndpointUrl).toBe("https://myresource.openai.azure.com")
			expect(currentConfig.openAiCompatibleOptions?.azureDeploymentName).toBe("text-embedding-3-large")
			expect(currentConfig.openAiCompatibleOptions?.azureApiVersion).toBe("2023-05-15")
		})
	})
})