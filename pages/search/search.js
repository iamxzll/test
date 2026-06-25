const db = wx.cloud.database()
const _ = db.command

const mockGears = [
  { _id: 'g1', name: '铁锭', description: '基础金属材料' },
  { _id: 'g2', name: '铜锭', description: '导电性良好的金属材料' },
  { _id: 'g3', name: '木头', description: '常见的基础材料' },
  { _id: 'g4', name: '布料', description: '柔软的纺织材料' },
  { _id: 'g5', name: '皮革', description: '坚韧的动物皮' },
  { _id: 'g6', name: '宝石', description: '闪亮的珍贵宝石' },
]

const mockMaterials = [
  {
    _id: 'm1',
    name: '铁剑',
    description: '一把锋利的铁制长剑，攻击力中等。',
    materials: ['铁锭', '木头', '皮革']
  },
  {
    _id: 'm2',
    name: '铜盾',
    description: '铜制盾牌，防御性能不错。',
    materials: ['铜锭', '木头', '皮革']
  },
  {
    _id: 'm3',
    name: '布甲',
    description: '轻便的布制护甲，适合敏捷职业。',
    materials: ['布料', '皮革']
  },
  {
    _id: 'm4',
    name: '精钢长剑',
    description: '经过千锤百炼的精钢长剑，攻击力极高。',
    materials: ['铁锭', '宝石', '皮革']
  },
  {
    _id: 'm5',
    name: '法杖',
    description: '蕴含魔力的法杖，增强法术效果。',
    materials: ['木头', '宝石', '布料']
  },
  {
    _id: 'm6',
    name: '皮靴',
    description: '舒适耐用的皮靴，提升移动速度。',
    materials: ['皮革', '布料']
  },
]

Page({
  data: {
    searchMode: 'gear',
    keyword: '',
    resultList: [],
    loading: false,
    searchFocus: false,
    matchedMaterial: '',
    useMock: true,
  },

  searchTimer: null,

  onLoad: function () {
    this.checkCloudEnv()
  },

  checkCloudEnv: function () {
    try {
      const app = getApp()
      if (app && app.globalData && wx.cloud) {
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
      matchedMaterial: '',
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
      this.setData({ resultList: [], matchedMaterial: '' })
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
      matchedMaterial: '',
      searchFocus: true,
    })
  },

  performSearch: function (keyword) {
    if (!keyword || !keyword.trim()) {
      this.setData({ resultList: [], matchedMaterial: '' })
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
        this.setData({
          resultList: res.data,
          loading: false,
        })
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
            matchedMaterial: '',
            loading: false,
          })
          return
        }

        const gearNames = matchedGears.map(g => g.name)
        this.findMaterialsByGears(gearNames, gearNames[0])
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

  findMaterialsByGears: function (gearNames, matchedName) {
    db.collection('materials')
      .where({
        materials: _.in(gearNames)
      })
      .get()
      .then(res => {
        this.setData({
          resultList: res.data,
          matchedMaterial: matchedName,
          loading: false,
        })
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

  mockSearchGear: function (keyword) {
    setTimeout(() => {
      const result = mockMaterials.filter(item =>
        item.name.toLowerCase().includes(keyword.toLowerCase())
      )
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
          matchedMaterial: '',
          loading: false,
        })
        return
      }

      const gearNames = matchedGears.map(g => g.name)
      const result = mockMaterials.filter(item =>
        item.materials.some(mat => gearNames.includes(mat))
      )

      this.setData({
        resultList: result,
        matchedMaterial: matchedGears[0].name,
        loading: false,
      })
    }, 200)
  },

  onItemTap: function (e) {
    const item = e.currentTarget.dataset.item
    console.log('点击了:', item)
  },
})
