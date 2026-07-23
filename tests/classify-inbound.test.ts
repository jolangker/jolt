import { describe, expect, it } from 'bun:test'
import { classifyInbound } from '../server/telegram/classify-inbound'

describe('classifyInbound', () => {
  it('classifies plain text Messages', () => {
    expect(classifyInbound({ text: 'beli kopi 20rb', date: 1_700_000_000 })).toEqual({
      kind: 'text',
      text: 'beli kopi 20rb',
    })
  })

  it('classifies voice Messages with mime default', () => {
    expect(classifyInbound({
      voice: { file_id: 'v1' },
      date: 1_700_000_000,
    })).toEqual({
      kind: 'voice',
      fileId: 'v1',
      mimeType: 'audio/ogg',
    })
  })

  it('classifies photo Messages using the largest size and caption', () => {
    expect(classifyInbound({
      photo: [{ file_id: 'small' }, { file_id: 'large' }],
      caption: 'kemarin',
      date: 1_720_000_000,
    })).toEqual({
      kind: 'image',
      fileId: 'large',
      mimeType: 'image/jpeg',
      caption: 'kemarin',
      messageDate: new Date(1_720_000_000 * 1000),
    })
  })

  it('classifies image documents by mime type', () => {
    expect(classifyInbound({
      document: { file_id: 'd1', mime_type: 'image/png', file_name: 'r.png' },
      date: 1_720_000_000,
    })).toMatchObject({
      kind: 'image',
      fileId: 'd1',
      mimeType: 'image/png',
    })
  })

  it('classifies PDFs as hard-failure kind', () => {
    expect(classifyInbound({
      document: { file_id: 'd2', mime_type: 'application/pdf', file_name: 'bill.pdf' },
      date: 1,
    })).toEqual({ kind: 'pdf' })
  })

  it('classifies media groups as albums', () => {
    expect(classifyInbound({
      media_group_id: 'g1',
      photo: [{ file_id: 'p1' }],
      date: 1,
    })).toEqual({ kind: 'album' })
  })

  it('classifies non-image documents as unsupported', () => {
    expect(classifyInbound({
      document: { file_id: 'd3', mime_type: 'application/zip', file_name: 'x.zip' },
      date: 1,
    })).toEqual({ kind: 'unsupported' })
  })
})
