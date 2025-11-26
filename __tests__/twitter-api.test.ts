import { GET, POST } from '../src/app/api/tweets/route'
import { GET as GET_TWEET, PATCH, DELETE } from '../src/app/api/tweets/[id]/route'
import { POST as ANALYZE } from '../src/app/api/tweets/[id]/analyze/route'

// Mock the Supabase client
const mockSupabase = {
  auth: {
    getUser: jest.fn()
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis()
}

// Mock the createServerClient function
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn().mockReturnValue(mockSupabase)
}))

// Mock cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    getAll: jest.fn().mockReturnValue([]),
    set: jest.fn()
  })
}))

describe('Twitter API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/tweets', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
      
      const request = new Request('http://localhost:3000/api/tweets')
      const response = await GET(request)
      
      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should return tweets for authenticated user', async () => {
      const mockUser = { id: 'user1' }
      const mockTweets = [
        { id: '1', content: 'Test tweet', created_by: 'user1' }
      ]
      
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockSupabase.select.mockReturnThis()
      mockSupabase.eq.mockReturnThis()
      mockSupabase.order.mockReturnThis()
      mockSupabase.range.mockReturnThis()
      mockSupabase.select.mockResolvedValue({ data: mockTweets, error: null })
      
      const request = new Request('http://localhost:3000/api/tweets')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual(mockTweets)
    })
  })

  describe('POST /api/tweets', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
      
      const request = new Request('http://localhost:3000/api/tweets', {
        method: 'POST',
        body: JSON.stringify({ url: 'https://twitter.com/user/status/123' })
      })
      const response = await POST(request)
      
      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 400 if URL is missing', async () => {
      const mockUser = { id: 'user1' }
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      
      const request = new Request('http://localhost:3000/api/tweets', {
        method: 'POST',
        body: JSON.stringify({})
      })
      const response = await POST(request)
      
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Tweet URL is required')
    })

    it('should return 400 if URL is not a Twitter URL', async () => {
      const mockUser = { id: 'user1' }
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      
      const request = new Request('http://localhost:3000/api/tweets', {
        method: 'POST',
        body: JSON.stringify({ url: 'https://example.com' })
      })
      const response = await POST(request)
      
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Invalid Twitter URL')
    })
  })

  describe('GET /api/tweets/[id]', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
      
      const request = new Request('http://localhost:3000/api/tweets/1')
      const response = await GET_TWEET(request, { params: { id: '1' } })
      
      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should return a specific tweet for authenticated user', async () => {
      const mockUser = { id: 'user1' }
      const mockTweet = { id: '1', content: 'Test tweet', created_by: 'user1' }
      
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockSupabase.select.mockReturnThis()
      mockSupabase.eq.mockReturnThis()
      mockSupabase.single.mockResolvedValue({ data: mockTweet, error: null })
      
      const request = new Request('http://localhost:3000/api/tweets/1')
      const response = await GET_TWEET(request, { params: { id: '1' } })
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual(mockTweet)
    })
  })

  describe('ANALYZE /api/tweets/[id]/analyze', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
      
      const request = new Request('http://localhost:3000/api/tweets/1/analyze', {
        method: 'POST'
      })
      const response = await ANALYZE(request, { params: { id: '1' } })
      
      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should analyze a tweet and return results', async () => {
      const mockUser = { id: 'user1' }
      const mockTweet = { id: '1', content: 'Test tweet', created_by: 'user1' }
      const mockAnalysis = {
        engagement_summary: 'High engagement',
        virality_score: 85,
        virality_reasons: ['Strong call to action'],
        suggestions: ['Post during peak hours'],
        best_posting_times: ['7:00 AM'],
        improvement_delta: 25
      }
      
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockSupabase.select.mockReturnThis()
      mockSupabase.eq.mockReturnThis()
      mockSupabase.single
        .mockResolvedValueOnce({ data: mockTweet, error: null }) // First call for fetching tweet
        .mockResolvedValueOnce({ data: { ...mockTweet, analysis_json: JSON.stringify(mockAnalysis) }, error: null }) // Second call for updating tweet
      
      const request = new Request('http://localhost:3000/api/tweets/1/analyze', {
        method: 'POST'
      })
      const response = await ANALYZE(request, { params: { id: '1' } })
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.analysis).toEqual(mockAnalysis)
    })
  })
})