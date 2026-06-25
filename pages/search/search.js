const db = wx.cloud.database()
const _ = db.command

const mockGears = [
  { id: 'mat_001', name: '铁锭' },
  { id: 'mat_002', name: '铜锭' },
  { id: 'mat_003', name: '木头' },
  { id: 'mat_004', name: '布料' },
  { id: 'mat_005', name: '皮革' },
  { id: 'mat_006', name: '宝石' },
]

const mockMaterials = [
  {
    _id: 'm1',
    name: '铁剑',
    body: '武器',
    type: '单手剑',
    materials: [
      { m_name: 'mat_001', count: 5 },
      { m_name: 'mat_003', count: 2 },
      { m_name: 'mat_005', count: 1 },
    ]
  },
  {
    _id: 'm2',
    name: '铜盾',
    body: '副手',
    type: '盾牌',
    materials: [
      { m_name: 'mat_002', count: 8 },
      { m_name: 'mat_003', count: 3 },
      { m_name: 'mat_005', count: 2 },
    ]
  },
  {
    _id: 'm3',
    name: '布甲',
    body: '胸部',
    type: '布甲',
    materials: [
      { m_name: 'mat_004', count: 10 },
      { m_name: 'mat_005', count: 3 },
    ]
  },
  {
    _id: 'm4',
    name: '精钢长剑',
    body: '武器',
    type: '双手剑',
    materials: [
      { m_name: 'mat_001', count: 12 },
      { m_name: 'mat_006', count: 2 },
      { m_name: 'mat_005', count: 2 },
    ]
  },
  {
    _id: 'm5',
    name: '法杖',
    body: '武器',
    type: '法杖',
    materials: [
      { m_name: 'mat_003', count: 3 },
      { m_name: 'mat_006', count: 5 },
      { m_name: 'mat_004', count: 2 },
    ]
  },
  {
    _id: 'm6',
    name: '皮靴',
    body: '脚部',
    type: '皮甲',
    materials: [
      { m_name: 'mat_005', count: 6 },
      { m_name: 'mat_004', count: 2 },
    ]
  },
]

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
  },

  searchTimer: null,

  onLoad: function () {
    this.checkCloudEnv()
  },

  checkCloudEnv: function () {
    try {
      if (wx.cloud) {
        this.setData({ useMock: false })
      }
    } catch (e) {
      this.setData({ useMock: true })
    }
  },

  switchSearchMode: function (e) {
    const mode = e.currentTarget.dataset.mode
    if (mode === this.data.searchMode) return

    this.setData({
      searchMode: mode,
      resultList: [],
      matchedMaterialId: '',
      matchedMaterialName: '',
    })

    if (this.data.keyword) {
      this.performSearch(this.data.keyword)
    }
  },

  onSearchInput: function (e) {
    const value = e.detail.value
    this.setData({ keyword: value })

    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
    }

    if (!value) {
      this.setData({
        resultList: [],
        matchedMaterialId: '',
        matchedMaterialName: '',
      })
      return
    }

    this.searchTimer = setTimeout(() => {
      this.performSearch(value)
    }, 300)
  },

  onSearchConfirm: function (e) {
    const value = e.detail.value
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
    }
    this.performSearch(value)
  },

  onClearSearch: function () {
    this.setData({
      keyword: '',
      resultList: [],
      matchedMaterialId: '',
      matchedMaterialName: '',
      searchFocus: true,
    })
  },

  performSearch: function (keyword) {
    if (!keyword || !keyword.trim()) {
      this.setData({
        resultList: [],
        matchedMaterialId: '',
        matchedMaterialName: '',
      })
      return
    }

    this.setData({ loading: true })

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
