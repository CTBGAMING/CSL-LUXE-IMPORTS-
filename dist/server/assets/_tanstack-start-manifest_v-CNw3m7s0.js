//#region \0tanstack-start-manifest:v
var tsrStartManifest = () => ({ routes: {
	__root__: {
		filePath: "I:/CSL LUXE WEBSITE/csl luxe website/src/routes/__root.tsx",
		children: [
			"/",
			"/_authenticated",
			"/auth",
			"/api/enhance-image",
			"/product/$id"
		],
		preloads: [
			"/assets/index-Dkv_x7xI.js",
			"/assets/useSelector-DY1WPcDI.js",
			"/assets/link-B0sh2XH_.js"
		],
		scripts: [{ attrs: {
			type: "module",
			async: !0,
			src: "/assets/index-Dkv_x7xI.js"
		} }]
	},
	"/": {
		filePath: "I:/CSL LUXE WEBSITE/csl luxe website/src/routes/index.tsx",
		children: void 0,
		preloads: [
			"/assets/routes-DkFvfIXU.js",
			"/assets/useQuery-O5qfwnfC.js",
			"/assets/site-nav-BbTypel_.js"
		]
	},
	"/_authenticated": {
		filePath: "I:/CSL LUXE WEBSITE/csl luxe website/src/routes/_authenticated/route.tsx",
		children: ["/_authenticated/admin"],
		preloads: ["/assets/route-DdewjGAc.js"]
	},
	"/auth": {
		filePath: "I:/CSL LUXE WEBSITE/csl luxe website/src/routes/auth.tsx",
		children: void 0,
		preloads: ["/assets/auth-C5UaLUgJ.js", "/assets/csl-luxe-logo-viYyHnIB.js"]
	},
	"/_authenticated/admin": {
		filePath: "I:/CSL LUXE WEBSITE/csl luxe website/src/routes/_authenticated/admin.tsx",
		children: void 0,
		preloads: [
			"/assets/admin-RDkLj_4l.js",
			"/assets/useQuery-O5qfwnfC.js",
			"/assets/csl-luxe-logo-viYyHnIB.js"
		]
	},
	"/product/$id": {
		filePath: "I:/CSL LUXE WEBSITE/csl luxe website/src/routes/product.$id.tsx",
		children: void 0,
		preloads: [
			"/assets/product._id-4b1VVQDD.js",
			"/assets/product._id-BErUv2wZ.js",
			"/assets/useBaseQuery-Bv98wzsO.js",
			"/assets/site-nav-BbTypel_.js",
			"/assets/product._id-CbGW1NZg.js"
		]
	}
} });
//#endregion
export { tsrStartManifest };
