import { POST as ANALYZE } from '../src/app/api/tweets/[id]/analyze/route'

// Mock the Supabase client
const mockSupabase = {
  auth: {
    getUser: jest.fn()
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
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

describe('Twitter Competitor Mode', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should analyze a competitor tweet the same as a regular tweet', async () => {
    const mockUser = { id: 'user1' }
    const mockCompetitorTweet = { 
      id: 'comp1', 
      content: 'Competitor tweet content', 
      created_by: 'user1',
      url: 'https://twitter.com/competitor/status/123'
    }
    
    const mockAnalysis = {
      engagement_summary: 'High engagement with strong organic reach',
      virality_score: 78,
      virality_reasons: [
        'Strong call to action',
        'Relevant hashtags',
        'Personal storytelling'
      ],
      suggestions: [
        'Add more specific metrics in future posts',
        'Include a clear CTA for better conversion'
      ],
      best_posting_times: ['7:00 AM', '12:00 PM', '6:00 PM'],
      improvement_delta: 25,
      competitor_comparison: {
        summary: 'Your tweet performs 15% better in engagement',
        strengths: ['Better hashtag usage', 'More personal tone'],
        weaknesses: ['Fewer media attachments'],
        recommendations: ['Add images to increase engagement']
      }
    }
    
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
    mockSupabase.select.mockReturnThis()
    mockSupabase.eq.mockReturnThis()
    mockSupabase.single
      .mockResolvedValueOnce({ data: mockCompetitorTweet, error: null }) // First call for fetching tweet
      .mockResolvedValueOnce({ data: { ...mockCompetitorTweet, analysis_json: JSON.stringify(mockAnalysis) }, error: null }) // Second call for updating tweet
    
    const request = new Request('http://localhost:3000/api/tweets/comp1/analyze', {
      method: 'POST'
    })
    const response = await ANALYZE(request, { params: { id: 'comp1' } })
    
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.analysis).toEqual(mockAnalysis)
    expect(data.analysis.competitor_comparison).toBeDefined()
  })
})