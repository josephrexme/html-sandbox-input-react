import { stringifyArray } from '../src'

describe('HTML Sandbox Input', () => {
  describe('stringifyArray', () => {
    it('turns array into comma separated strings', () => {
      expect(stringifyArray([1,2,3,4])).toEqual('1, 2, 3, 4')
    })
    it('removes duplicates', () => {
      expect(stringifyArray(['cat', 'dog', 'cat', 'bunny'])).toEqual('cat, dog, bunny')
    })
  })
})