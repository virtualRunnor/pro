import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBoardStore = defineStore('board', () => {
  const boardList = ref([])
  const activepBoardId = ref(0)
  const activeBoardId = ref(0)
  // 定义一个 mutation 来更新 boardList
  const updateBoardList = (newList) => {
    boardList.value = newList
  }
  // 定义一个 getter 计算属性
  const getSubBoardList = (boardId) => {
    let subBoard = boardList.value.find((item) => {
      return item.boardId == boardId
    })
    return subBoard ? subBoard.children : []
  }

  //版块信息
  const setActivepBoardId = (id) => {
    // console.log(id)
    activepBoardId.value = id
  }
  const setActiveBoardId = (id) => {
    activeBoardId.value = id
  }
  return {
    boardList,
    activepBoardId,
    activeBoardId,
    updateBoardList,
    getSubBoardList,
    setActivepBoardId,
    setActiveBoardId
  }
})
