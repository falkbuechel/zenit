# Berg-Gorilla als Formen-Blockout: jede Muskelgruppe ein Ellipsoid, Toon-Shading (2 Töne + Glanz), Kontur per Inverted Hull.
# Aufruf: blender -b -P gorilla.py -- <modus> <ausgabe.png>   modus: sheet (4 Ansichten Stufe Stark) | tiers (Neuling..Meister)
import bpy, sys, math
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
MODE = argv[0] if argv else 'sheet'
OUT = argv[1] if len(argv) > 1 else '//gor.png'

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

def srgb(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + .055) / 1.055) ** 2.4 if x > .04045 else x / 12.92 for x in c) + (1,)

def toon(name, base, shade, hi=None):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links
    N.clear()
    o = N.new('ShaderNodeOutputMaterial'); d = N.new('ShaderNodeBsdfDiffuse'); s = N.new('ShaderNodeShaderToRGB')
    r = N.new('ShaderNodeValToRGB'); e = N.new('ShaderNodeEmission')
    r.color_ramp.interpolation = 'CONSTANT'; el = r.color_ramp.elements
    el[0].position = 0; el[0].color = srgb(shade); el[1].position = .22; el[1].color = srgb(base)
    if hi: x = el.new(.75); x.color = srgb(hi)
    L.new(d.outputs[0], s.inputs[0]); L.new(s.outputs[0], r.inputs[0]); L.new(r.outputs[0], e.inputs[0]); L.new(e.outputs[0], o.inputs[0])
    return m

def flat(name, col):
    m = bpy.data.materials.new(name); m.use_nodes = True; N = m.node_tree.nodes; N.clear()
    o = N.new('ShaderNodeOutputMaterial'); e = N.new('ShaderNodeEmission'); e.inputs[0].default_value = srgb(col)
    m.node_tree.links.new(e.outputs[0], o.inputs[0]); return m

INK = flat('ink', '#0b0d0b'); INK.use_backface_culling = True
FUR = toon('fur', '#2f3731', '#181d19', '#46514a')
FUR2 = toon('fur2', '#3a443d', '#1d231f', '#56635a')   # Schultern, Unterarme: etwas heller fürs Volumen
SKIN = toon('skin', '#8b988e', '#5f6b62', '#a9b5ac')
DARK = toon('dark', '#1c211d', '#0f1210')
SILV = toon('silver', '#b9c4bb', '#7f8b82', '#d9e1da')
WHITE = flat('white', '#f1f3ee'); BLACK = flat('black', '#0b0d0b')
WRAP = toon('wrap', '#e6eae3', '#a7ada4')
TIERC = ['#b6c3bd', '#52f08a', '#4aa8ff', '#c46bff', '#ffb21e', '#38f2ff']

base = bpy.data.meshes.new('ell')
import bmesh
bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=24, radius=1); bm.to_mesh(base); bm.free()
for p in base.polygons: p.use_smooth = True

def ell(parent, name, loc, scl, mat, rot=(0, 0, 0), line=1.0):
    o = bpy.data.objects.new(name, base.copy()); bpy.context.collection.objects.link(o)
    o.location = loc; o.scale = scl; o.rotation_euler = [math.radians(a) for a in rot]; o.parent = parent
    # Material am Objekt (Mesh wird geteilt)
    o.modifiers.new('o', 'SOLIDIFY')
    for i, m in enumerate((mat, INK)):
        o.material_slots[i].link = 'OBJECT'; o.material_slots[i].material = m
    sd = o.modifiers['o']; avg = sum(scl) / 3
    sd.thickness = .011 * line / avg; sd.show_viewport = sd.show_render = line > 0; sd.offset = 1; sd.use_flip_normals = True; sd.material_offset = 1; sd.use_rim = False
    return o

# Mesh braucht 2 Slots, damit die Objekte eigene Materialien bekommen
base.materials.append(FUR); base.materials.append(INK)

def fuse(objs, name, mat, vox=.01, smooth=24):
    # Formen zu einem Körper verschmelzen: verbinden, Voxel-Remesh, glätten, Kontur
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.data = o.data.copy(); o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.convert(target='MESH')
    bpy.ops.object.join(); o = bpy.context.active_object; o.name = name
    for md in list(o.modifiers): o.modifiers.remove(md)
    r = o.modifiers.new('r', 'REMESH'); r.mode = 'VOXEL'; r.voxel_size = vox
    sm = o.modifiers.new('s', 'SMOOTH'); sm.factor = 1; sm.iterations = smooth
    bpy.ops.object.convert(target='MESH')
    o.data.materials.clear(); o.data.materials.append(mat); o.data.materials.append(INK)
    for p in o.data.polygons: p.use_smooth = True
    sd = o.modifiers.new('o', 'SOLIDIFY'); sd.thickness = .013; sd.offset = 1; sd.use_flip_normals = True; sd.material_offset = 1; sd.use_rim = False
    return o

def gorilla(x, rz, tier):
    root = bpy.data.objects.new('g', None); bpy.context.collection.objects.link(root)
    m = [.8, .88, .94, 1.0, 1.1, 1.2][tier]        # Muskelmasse je Stufe
    G = {'fur': [], 'skin': []}
    def E(n, loc, scl, mat, rot=(0, 0, 0), mir=False, mass=True, line=1.0, grp=None):
        sl = tuple(v * m for v in scl) if mass else scl
        L = (loc[0] * (1 + (m - 1) * .8), loc[1], loc[2])
        out = [ell(None, n, L, sl, mat, rot, line)]
        if mir: out.append(ell(None, n + 'R', (-L[0], L[1], L[2]), sl, mat, (rot[0], -rot[1], -rot[2]), line))
        if grp: G[grp] += out
        else:
            for o in out: o.parent = root
    # Rumpf: schwer, nach vorn geneigt
    E('torso', (0, .02, 1.32), (.44, .32, .42), FUR, (-8, 0, 0), grp='fur')
    E('belly', (0, .0, .98), (.32, .26, .27), FUR, grp='fur')
    E('traps', (0, .1, 1.64), (.36, .25, .2), FUR, (-20, 0, 0), grp='fur')
    E('lat', (.3, .05, 1.26), (.15, .22, .28), FUR, (0, 10, 0), True, grp='fur')
    E('delt', (.49, 0, 1.54), (.19, .19, .17), FUR, (0, 20, 0), True, grp='fur')
    E('bic', (.61, -.06, 1.28), (.11, .115, .18), FUR, (0, 12, 0), True, grp='fur')
    E('tri', (.63, .07, 1.3), (.11, .11, .19), FUR, (0, 12, 0), True, grp='fur')
    E('elb', (.67, .02, 1.12), (.09, .09, .08), FUR, mir=True, grp='fur')
    E('fore', (.71, -.04, .92), (.155, .15, .25), FUR, (0, 6, 0), True, grp='fur')
    E('glute', (.17, .05, .84), (.18, .18, .15), FUR, mir=True, grp='fur')
    E('quad', (.21, -.03, .58), (.14, .15, .2), FUR, (0, -4, 0), True, grp='fur')
    E('calf', (.23, .03, .3), (.11, .12, .14), FUR, mir=True, grp='fur')
    E('head', (0, -.12, 1.80), (.165, .165, .17), FUR, mass=False, grp='fur')
    E('dome', (0, -.05, 1.9), (.12, .14, .09), FUR, (-20, 0, 0), mass=False, grp='fur')
    # Haut: Brustplatten, Bauch, Gesicht, Fäuste, Füße
    E('pec', (.15, -.25, 1.47), (.17, .085, .12), SKIN, (0, -8, 0), True, grp='skin')
    E('abs', (0, -.235, 1.13), (.14, .08, .2), SKIN, grp='skin')
    E('face', (0, -.235, 1.79), (.125, .06, .115), SKIN, mass=False, grp='skin')
    E('muzzle', (0, -.285, 1.72), (.105, .07, .065), SKIN, mass=False, grp='skin')
    E('ear', (.165, -.11, 1.82), (.03, .03, .045), SKIN, mir=True, mass=False, grp='skin')
    fur = fuse(G['fur'], 'fur', FUR); skin = fuse(G['skin'], 'skin', SKIN, .008, 16)
    fur.parent = root; skin.parent = root
    E('fist', (.73, -.08, .6), (.13, .14, .12), SKIN, mir=True)
    E('knk', (.73, -.19, .62), (.105, .045, .05), SKIN, mir=True, line=.6)
    E('chalk', (.73, -.17, .66), (.09, .04, .03), WHITE, mir=True, line=0)
    E('foot', (.24, -.08, .07), (.11, .18, .065), SKIN, mir=True)
    if tier >= 2: E('wrap', (.72, -.06, .73), (.13, .13, .04), WRAP, (0, 6, 0), True, line=.6)
    # Kletterseil als Gürtel
    rope = toon('rope', '#4c5a50', '#2a332d', '#6c7c70')
    E('rope', (0, -.02, .9), (.335, .28, .035), rope, line=.6)
    E('knot', (.12, -.27, .88), (.05, .03, .045), rope, line=.6)
    # Silberrücken ab Stufe 3, Gipfelform
    if tier >= 3:
        E('silv', (0, .25, 1.48), (.3, .1, .22), SILV, (-12, 0, 0), line=.7)
        E('silv2', (0, .28, 1.27), (.11, .07, .13), SILV, line=.7)
    # Gesicht
    E('nose', (0, -.345, 1.765), (.05, .025, .028), DARK, mass=False, line=.5)
    E('brow', (0, -.27, 1.865), (.145, .06, .038), DARK, mass=False)
    E('eye', (.055, -.288, 1.828), (.028, .012, .022), WHITE, mir=True, mass=False, line=.5)
    E('pup', (.052, -.299, 1.826), (.013, .006, .013), BLACK, mir=True, mass=False, line=0)
    E('mouth', (.0, -.35, 1.705), (.055, .012, .008), DARK, (0, 6, 0), mass=False, line=0)
    E('scar', (-.06, -.3, 1.87), (.006, .01, .04), SILV, (0, 20, 0), mass=False, line=0)
    # Stirnband in Stufenfarbe
    band = toon('band%d' % tier, TIERC[tier], '#' + ''.join('%02x' % int(int(TIERC[tier][i:i + 2], 16) * .55) for i in (1, 3, 5)))
    bpy.ops.mesh.primitive_torus_add(major_radius=.165, minor_radius=.02, location=(0, 0, 0))
    tb = bpy.context.active_object; tb.parent = root; tb.location = (0, -.12, 1.87); tb.scale = (1.02, 1.05, 1.6); tb.rotation_euler = (math.radians(-12), 0, 0)
    tb.data.materials.append(band); tb.data.materials.append(INK)
    s = tb.modifiers.new('o', 'SOLIDIFY'); s.thickness = .008; s.offset = 1; s.use_flip_normals = True; s.material_offset = 1
    bpy.ops.object.shade_smooth()
    E('tail1', (.07, .1, 1.86), (.14, .022, .032), band, (0, -10, 40), mass=False)
    E('tail2', (.12, .12, 1.81), (.12, .02, .026), band, (0, -25, 55), mass=False)
    root.location = (x, 0, 0); root.rotation_euler = (0, 0, math.radians(rz))
    return root

def cam(width, zc, scale):
    c = bpy.data.cameras.new('c'); c.type = 'ORTHO'; c.ortho_scale = scale
    o = bpy.data.objects.new('cam', c); sc.collection.objects.link(o); sc.camera = o
    o.location = (width / 2, -10, zc); o.rotation_euler = (math.radians(90), 0, 0)

if MODE == 'sheet':
    for i, rz in enumerate((0, -35, -90, 180)): gorilla(.9 + i * 1.8, rz, 3)
    cam(7.2, 1.05, 7.4); sc.render.resolution_x, sc.render.resolution_y = 1800, 560
elif MODE == 'tiers':
    for i, t in enumerate((0, 2, 3, 5)): gorilla(.9 + i * 1.8, -30, t)
    cam(7.2, 1.05, 7.4); sc.render.resolution_x, sc.render.resolution_y = 1800, 560
else:  # einzeln für die App: modus = single:<stufe>
    gorilla(0, -25, int(MODE.split(':')[1])); cam(0, 1.12, 2.5); sc.render.resolution_x, sc.render.resolution_y = 720, 800

sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 3.2; sun.use_shadow = False; so = bpy.data.objects.new('sun', sun); sc.collection.objects.link(so)
so.rotation_euler = (math.radians(50), math.radians(-20), math.radians(-35))
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[1].default_value = .25
sc.render.engine = 'BLENDER_EEVEE'; sc.render.film_transparent = True
sc.view_settings.view_transform = 'Standard'
sc.render.filepath = OUT; sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
bpy.ops.render.render(write_still=True)
