export function roomIdFor(arg1, arg2) {
  // object form: { deptId, headId }
  if (arg1 && typeof arg1 === "object") {
    const { deptId, headId } = arg1
    return `civic:${deptId}:${headId}`
  }
  // tuple form: (deptId, headId)
  return `civic:${arg1}:${arg2}`
}
