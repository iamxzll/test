const db = wx.cloud.database()
const _ = db.command
Page({
  data: {
    searchMode: 'gear',
    keyword: '',
    resultList: [],
    loading: false,
    searchFocus: false,
    matchedMaterialId: '',
    matchedMaterialName: '',
    useMock: true,
    searched: false,
  },
 
  onLoad: function () {
    this.checkCloudEnv()
  },
 
  checkCloudEnv: function () {
    try {
      if (!db) {
        this.setData({ useMock: true })
        return
      }
 
      db.collection('gears').limit(1).get()
        .then(() => {
          this.setData({ useMock: false })
        })
        .catch(() => {
          this.setData({ useMock: true })
        })
    } catch (e) {
      this.setData({ useMock: true })
    }
  },
 
  switchSearchMode: function (e) {
    const mode = e.currentTarget.dataset.mode
    if (mode === this.data.searchMode) return
 
    this.setData({
      searchMode: mode,
    })
  },
 
  onSearchInput: function (e) {
    const value = e.detail.value
    this.setData({ keyword: value })
 
    if (!value) {
      this.setData({
        resultList: [],
        matchedMaterialId: '',
        matchedMaterialName: '',
        searched: false,
      })
    }
  },
 
  onSearchClick: function () {
    const keyword = this.data.keyword
    if (!keyword || !keyword.trim()) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none',
      })
      return
    }
    this.performSearch(keyword.trim())
  },
 
  onSearchConfirm: function (e) {
    const value = e.detail.value
    if (!value || !value.trim()) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none',
      })
      return
    }
    this.performSearch(value.trim())
  },
 
  onClearSearch: function () {
    this.setData({
      keyword: '',
      resultList: [],
      matchedMaterialId: '',
      matchedMaterialName: '',
      searchFocus: true,
      searched: false,
    })
  },
 
  performSearch: function (keyword) {
    if (!keyword || !keyword.trim()) {
      this.setData({
        resultList: [],
        matchedMaterialId: '',
        matchedMaterialName: '',
        searched: false,
      })
      return
    }
 
    this.setData({ loading: true, searched: true })
 
    if (this.data.searchMode === 'gear') {
      this.searchGearByName(keyword)
    } else {
      this.searchMaterialByName(keyword)
    }
  },
 
  searchGearByName: function (keyword) {
    if (this.data.useMock) {
      this.mockSearchGear(keyword)
      return
    }
 
    db.collection('materials')
      .where({
        name: db.RegExp({
          regexp: keyword,
          options: 'i',
        })
      })
      .get()
      .then(res => {
        const list = res.data
        this.fillMaterialNames(list)
      })
      .catch(err => {
        console.error('搜索装备失败:', err)
        this.setData({ loading: false })
        wx.showToast({
          title: '搜索失败',
          icon: 'none',
        })
      })
  },
 
  searchMaterialByName: function (keyword) {
    if (this.data.useMock) {
      this.mockSearchMaterial(keyword)
      return
    }
 
    db.collection('gears')
      .where({
        name: db.RegExp({
          regexp: keyword,
          options: 'i',
        })
      })
      .get()
      .then(res => {
        const matchedGears = res.data
        if (matchedGears.length === 0) {
          this.setData({
            resultList: [],
            matchedMaterialId: '',
            matchedMaterialName: '',
            loading: false,
          })
          return
        }
 
        const gearIds = matchedGears.map(g => g.id)
        const firstGear = matchedGears[0]
        this.findMaterialsByGearIds(gearIds, firstGear.id, firstGear.name)
      })
      .catch(err => {
        console.error('搜索材料失败:', err)
        this.setData({ loading: false })
        wx.showToast({
          title: '搜索失败',
          icon: 'none',
        })
      })
  },
 
  findMaterialsByGearIds: function (gearIds, matchedId, matchedName) {
    db.collection('materials')
      .where({
        'materials.m_name': _.in(gearIds)
      })
      .get()
      .then(res => {
        const list = res.data
        this.setData({
          matchedMaterialId: matchedId,
          matchedMaterialName: matchedName,
        })
        this.fillMaterialNames(list)
      })
      .catch(err => {
        console.error('查询装备失败:', err)
        this.setData({ loading: false })
        wx.showToast({
          title: '搜索失败',
          icon: 'none',
        })
      })
  },
 
  fillMaterialNames: function (materialList) {
    if (this.data.useMock) {
      const result = materialList.map(item => ({
        ...item,
        materialsWithName: item.materials.map(mat => {
          const gear = mockGears.find(g => g.id === mat.m_name)
          return {
            ...mat,
            name: gear ? gear.name : mat.m_name,
          }
        })
      }))
      this.setData({
        resultList: result,
        loading: false,
      })
      return
    }
 
    const allMatIds = []
    materialList.forEach(item => {
      item.materials.forEach(mat => {
        if (!allMatIds.includes(mat.m_name)) {
          allMatIds.push(mat.m_name)
        }
      })
    })
 
    if (allMatIds.length === 0) {
      this.setData({
        resultList: materialList,
        loading: false,
      })
      return
    }
 
    db.collection('gears')
      .where({
        id: _.in(allMatIds)
      })
      .get()
      .then(res => {
        const gearMap = {}
        res.data.forEach(g => {
          gearMap[g.id] = g.name
        })
 
        const result = materialList.map(item => ({
          ...item,
          materialsWithName: item.materials.map(mat => ({
            ...mat,
            name: gearMap[mat.m_name] || mat.m_name,
          }))
        }))
 
        this.setData({
          resultList: result,
          loading: false,
        })
      })
      .catch(err => {
        console.error('查询材料名称失败:', err)
        this.setData({
          resultList: materialList,
          loading: false,
        })
      })
  },
 
  mockSearchGear: function (keyword) {
    setTimeout(() => {
      const list = mockMaterials.filter(item =>
        item.name.toLowerCase().includes(keyword.toLowerCase())
      )
      const result = list.map(item => ({
        ...item,
        materialsWithName: item.materials.map(mat => {
          const gear = mockGears.find(g => g.id === mat.m_name)
          return {
            ...mat,
            name: gear ? gear.name : mat.m_name,
          }
        })
      }))
      this.setData({
        resultList: result,
        loading: false,
      })
    }, 200)
  },
 
  mockSearchMaterial: function (keyword) {
    setTimeout(() => {
      const matchedGears = mockGears.filter(g =>
        g.name.toLowerCase().includes(keyword.toLowerCase())
      )
 
      if (matchedGears.length === 0) {
        this.setData({
          resultList: [],
          matchedMaterialId: '',
          matchedMaterialName: '',
          loading: false,
        })
        return
      }
 
      const gearIds = matchedGears.map(g => g.id)
      const firstGear = matchedGears[0]
 
      const list = mockMaterials.filter(item =>
        item.materials.some(mat => gearIds.includes(mat.m_name))
      )
 
      const result = list.map(item => ({
        ...item,
        materialsWithName: item.materials.map(mat => {
          const gear = mockGears.find(g => g.id === mat.m_name)
          return {
            ...mat,
            name: gear ? gear.name : mat.m_name,
          }
        })
      }))
 
      this.setData({
        resultList: result,
        matchedMaterialId: firstGear.id,
        matchedMaterialName: firstGear.name,
        loading: false,
      })
    }, 200)
  },
 
  onItemTap: function (e) {
    const item = e.currentTarget.dataset.item
    console.log('点击了:', item)
  },
})
