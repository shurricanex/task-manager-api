const { calculateTip } = require("../math")

test('should calculate total with tip',()=> {
    const total = calculateTip(30,.5)
    expect(total).toBe(45)
    // if (total !== 45) {
    //     throw new Error(`got ${total}, it should be 45`)
    // }
})
